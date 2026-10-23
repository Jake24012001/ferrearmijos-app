require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { validarProducto } = require('./validaciones');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET) {
    throw new Error('Falta configurar JWT_SECRET en el archivo .env');
}

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200'
}));
app.use(express.json({ limit: '100kb' }));

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'ferrearmijos_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000
});

// ---------- UTILIDADES ----------

function numeroPositivoEntero(valor) {
    return Number.isInteger(Number(valor)) && Number(valor) > 0;
}

function autenticar(req, res, next) {
    const cabecera = req.headers.authorization;

    if (!cabecera || !cabecera.startsWith('Bearer ')) {
        return res.status(401).json({
            mensaje: 'Debe iniciar sesión para continuar.'
        });
    }

    const token = cabecera.substring(7);

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            mensaje: 'Token inválido o vencido. Inicie sesión nuevamente.'
        });
    }
}

function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'No tiene permisos de administrador.'
        });
    }

    next();
}

function manejarError(res, error, mensaje = 'Error interno del servidor.') {
    console.error(error);

    if (error.code === '23505') {
        return res.status(409).json({
            mensaje: 'Ya existe un registro con ese código o correo.'
        });
    }

    if (error.code === '23503') {
        return res.status(400).json({
            mensaje: 'El registro relacionado no existe.'
        });
    }

    return res.status(500).json({ mensaje });
}

// ---------- SALUD DEL SERVIDOR ----------

app.get('/api/salud', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            estado: 'correcto',
            mensaje: 'API de FerreArmijos funcionando.',
            baseDatos: 'conectada'
        });
    } catch (error) {
        console.error(error);
        res.status(503).json({
            estado: 'error',
            mensaje: 'El servidor funciona, pero no puede conectar con PostgreSQL.'
        });
    }
});

// ---------- AUTENTICACIÓN ----------

// Registro público: todos los nuevos usuarios son clientes.
app.post('/api/auth/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (
            typeof nombre !== 'string' ||
            !nombre.trim() ||
            nombre.trim().length > 100 ||
            typeof email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            email.trim().length > 150 ||
            typeof password !== 'string' ||
            password.length < 12
        ) {
            return res.status(400).json({
                mensaje: 'Ingrese un nombre válido, un correo válido y una contraseña de al menos 12 caracteres.'
            });
        }

        const hash = await bcrypt.hash(password, 12);

        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol)
             VALUES ($1, LOWER($2), $3, 'cliente')
             RETURNING id, nombre, email, rol`,
            [nombre.trim(), email.trim(), hash]
        );

        return res.status(201).json({
            mensaje: 'Cuenta de cliente creada correctamente.',
            usuario: resultado.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                mensaje: 'Ese correo ya está registrado.'
            });
        }

        return manejarError(res, error, 'No se pudo registrar el usuario.');
    }
});

// Inicio de sesión.
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                mensaje: 'El correo y la contraseña son obligatorios.'
            });
        }

        const resultado = await pool.query(
            `SELECT id, nombre, email, password_hash, rol
             FROM usuarios
             WHERE email = LOWER($1) AND activo = TRUE`,
            [email.trim()]
        );

        if (
            resultado.rowCount === 0 ||
            !(await bcrypt.compare(password, resultado.rows[0].password_hash))
        ) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos.'
            });
        }

        const usuario = resultado.rows[0];

        const token = jwt.sign(
            {
                sub: String(usuario.id),
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            mensaje: 'Inicio de sesión correcto.',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        return manejarError(res, error, 'No se pudo iniciar sesión.');
    }
});

// Información del usuario autenticado.
app.get('/api/auth/perfil', autenticar, async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id, nombre, email, rol
             FROM usuarios
             WHERE id = $1 AND activo = TRUE`,
            [req.usuario.sub]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado o inactivo.'
            });
        }

        res.json({ usuario: resultado.rows[0] });
    } catch (error) {
        manejarError(res, error, 'No se pudo consultar el perfil.');
    }
});

// ---------- SUCURSALES ----------

app.get('/api/sucursales', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id, nombre, ciudad FROM sucursales ORDER BY nombre'
        );

        res.json(resultado.rows);
    } catch (error) {
        manejarError(res, error, 'No se pudieron consultar las sucursales.');
    }
});

// ---------- CATÁLOGO PÚBLICO ----------

// El cliente ve precios de venta y stock total, nunca los costos de compra.
app.get('/api/productos', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                p.id, p.codigo, p.nombre, p.descripcion, p.categoria,
                p.precio_venta,
                COALESCE(SUM(i.stock), 0)::INTEGER AS stock_total
             FROM productos p
             LEFT JOIN inventario i ON i.producto_id = p.id
             WHERE p.activo = TRUE
             GROUP BY p.id
             ORDER BY p.nombre`
        );

        res.json(rows);
    } catch (error) {
        manejarError(res, error, 'No se pudieron consultar los productos.');
    }
});

// Categorías existentes.
app.get('/api/categorias', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT DISTINCT categoria
             FROM productos
             WHERE activo = TRUE
             ORDER BY categoria`
        );

        res.json(rows.map(fila => fila.categoria));
    } catch (error) {
        manejarError(res, error, 'No se pudieron consultar las categorías.');
    }
});

// ---------- ADMINISTRACIÓN DE PRODUCTOS ----------

// Listado administrativo: incluye costo, venta y margen.
app.get('/api/admin/productos', autenticar, soloAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                p.id, p.codigo, p.nombre, p.descripcion, p.categoria,
                p.precio_compra, p.precio_venta, p.activo,
                ROUND(p.precio_venta - p.precio_compra, 2) AS ganancia_unitaria,
                CASE
                    WHEN p.precio_venta > 0 THEN
                        ROUND(
                            ((p.precio_venta - p.precio_compra)
                             / p.precio_venta) * 100, 2
                        )
                    ELSE 0
                END AS margen_porcentaje
             FROM productos p
             ORDER BY p.nombre`
        );

        res.json(rows);
    } catch (error) {
        manejarError(res, error, 'No se pudieron consultar los productos administrativos.');
    }
});

// Crear producto.
app.post('/api/productos', autenticar, soloAdmin, async (req, res) => {
    try {
        const errorValidacion = validarProducto(req.body);

        if (errorValidacion) {
            return res.status(400).json({ mensaje: errorValidacion });
        }

        const {
            codigo, nombre, descripcion, categoria,
            precio_compra, precio_venta
        } = req.body;

        const resultado = await pool.query(
            `INSERT INTO productos
                (codigo, nombre, descripcion, categoria, precio_compra, precio_venta)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, codigo, nombre, descripcion, categoria,
                       precio_compra, precio_venta, activo`,
            [
                codigo.trim(),
                nombre.trim(),
                typeof descripcion === 'string' ? descripcion.trim() : '',
                categoria.trim(),
                Number(precio_compra),
                Number(precio_venta)
            ]
        );

        res.status(201).json({
            mensaje: 'Producto creado correctamente.',
            producto: resultado.rows[0]
        });
    } catch (error) {
        manejarError(res, error, 'No se pudo crear el producto.');
    }
});

// Modificar producto.
app.put('/api/productos/:id', autenticar, soloAdmin, async (req, res) => {
    try {
        if (!numeroPositivoEntero(req.params.id)) {
            return res.status(400).json({ mensaje: 'ID de producto inválido.' });
        }

        const errorValidacion = validarProducto(req.body);

        if (errorValidacion) {
            return res.status(400).json({ mensaje: errorValidacion });
        }

        const {
            codigo, nombre, descripcion, categoria,
            precio_compra, precio_venta
        } = req.body;

        const resultado = await pool.query(
            `UPDATE productos
             SET codigo = $1, nombre = $2, descripcion = $3, categoria = $4,
                 precio_compra = $5, precio_venta = $6
             WHERE id = $7 AND activo = TRUE
             RETURNING id, codigo, nombre, descripcion, categoria,
                       precio_compra, precio_venta, activo`,
            [
                codigo.trim(),
                nombre.trim(),
                typeof descripcion === 'string' ? descripcion.trim() : '',
                categoria.trim(),
                Number(precio_compra),
                Number(precio_venta),
                Number(req.params.id)
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }

        res.json({
            mensaje: 'Producto actualizado correctamente.',
            producto: resultado.rows[0]
        });
    } catch (error) {
        manejarError(res, error, 'No se pudo actualizar el producto.');
    }
});

// Desactivar producto sin eliminar el historial de pedidos.
app.delete('/api/productos/:id', autenticar, soloAdmin, async (req, res) => {
    try {
        if (!numeroPositivoEntero(req.params.id)) {
            return res.status(400).json({ mensaje: 'ID de producto inválido.' });
        }

        const resultado = await pool.query(
            `UPDATE productos SET activo = FALSE
             WHERE id = $1 AND activo = TRUE
             RETURNING id, nombre`,
            [Number(req.params.id)]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado o ya desactivado.' });
        }

        res.json({ mensaje: 'Producto desactivado correctamente.' });
    } catch (error) {
        manejarError(res, error, 'No se pudo desactivar el producto.');
    }
});

// ---------- INVENTARIO POR SUCURSAL ----------

// El administrador consulta el stock por producto y sucursal.
app.get('/api/admin/inventario', autenticar, soloAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                i.id, p.id AS producto_id, p.codigo, p.nombre,
                s.id AS sucursal_id, s.nombre AS sucursal,
                s.ciudad, i.stock
             FROM inventario i
             JOIN productos p ON p.id = i.producto_id
             JOIN sucursales s ON s.id = i.sucursal_id
             ORDER BY s.nombre, p.nombre`
        );

        res.json(rows);
    } catch (error) {
        manejarError(res, error, 'No se pudo consultar el inventario.');
    }
});

// Establecer stock para una sucursal y un producto.
app.put('/api/admin/inventario', autenticar, soloAdmin, async (req, res) => {
    try {
        const { producto_id, sucursal_id, stock } = req.body;

        if (
            !numeroPositivoEntero(producto_id) ||
            !numeroPositivoEntero(sucursal_id) ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            return res.status(400).json({
                mensaje: 'Producto, sucursal y stock deben tener valores válidos.'
            });
        }

        const producto = await pool.query(
            'SELECT id FROM productos WHERE id = $1 AND activo = TRUE',
            [producto_id]
        );
        const sucursal = await pool.query(
            'SELECT id FROM sucursales WHERE id = $1',
            [sucursal_id]
        );

        if (!producto.rowCount || !sucursal.rowCount) {
            return res.status(404).json({
                mensaje: 'El producto o la sucursal no existen o no están disponibles.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO inventario (producto_id, sucursal_id, stock)
             VALUES ($1, $2, $3)
             ON CONFLICT (producto_id, sucursal_id)
             DO UPDATE SET stock = EXCLUDED.stock
             RETURNING *`,
            [producto_id, sucursal_id, stock]
        );

        res.json({
            mensaje: 'Inventario actualizado correctamente.',
            inventario: resultado.rows[0]
        });
    } catch (error) {
        manejarError(res, error, 'No se pudo actualizar el inventario.');
    }
});

// ---------- PEDIDOS DE CLIENTES ----------

// Consultar pedidos propios. El administrador también puede consultar todos.
app.get('/api/pedidos', autenticar, async (req, res) => {
    try {
        const esAdmin = req.usuario.rol === 'admin';

        const resultado = await pool.query(
            `SELECT
                p.id, p.fecha, p.estado, p.total,
                s.nombre AS sucursal,
                u.nombre AS cliente,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'producto_id', d.producto_id,
                            'producto', pr.nombre,
                            'cantidad', d.cantidad,
                            'precio_unitario', d.precio_unitario,
                            'subtotal', d.subtotal
                        )
                    ) FILTER (WHERE d.id IS NOT NULL),
                    '[]'::json
                ) AS detalle
             FROM pedidos p
             JOIN sucursales s ON s.id = p.sucursal_id
             JOIN usuarios u ON u.id = p.usuario_id
             LEFT JOIN pedido_detalle d ON d.pedido_id = p.id
             LEFT JOIN productos pr ON pr.id = d.producto_id
             WHERE ($1::BOOLEAN = TRUE OR p.usuario_id = $2)
             GROUP BY p.id, s.nombre, u.nombre
             ORDER BY p.fecha DESC`,
            [esAdmin, Number(req.usuario.sub)]
        );

        res.json(resultado.rows);
    } catch (error) {
        manejarError(res, error, 'No se pudieron consultar los pedidos.');
    }
});

// Crear un pedido y descontar el inventario de manera transaccional.
app.post('/api/pedidos', autenticar, async (req, res) => {
    const cliente = await pool.connect();
    let transaccionAbierta = false;

    try {
        const { sucursal_id, items } = req.body;

        if (
            !numeroPositivoEntero(sucursal_id) ||
            !Array.isArray(items) ||
            items.length === 0 ||
            items.length > 50
        ) {
            return res.status(400).json({
                mensaje: 'Seleccione una sucursal e incluya productos en el pedido.'
            });
        }

        const cantidades = new Map();

        for (const item of items) {
            if (
                !numeroPositivoEntero(item.producto_id) ||
                !numeroPositivoEntero(item.cantidad) ||
                item.cantidad > 10000
            ) {
                return res.status(400).json({
                    mensaje: 'Cada producto debe tener un ID y una cantidad válidos.'
                });
            }

            const id = Number(item.producto_id);
            cantidades.set(id, (cantidades.get(id) || 0) + Number(item.cantidad));
        }

        await cliente.query('BEGIN');
        transaccionAbierta = true;

        const sucursal = await cliente.query(
            'SELECT id FROM sucursales WHERE id = $1',
            [Number(sucursal_id)]
        );

        if (!sucursal.rowCount) {
            await cliente.query('ROLLBACK');
            transaccionAbierta = false;
            return res.status(404).json({ mensaje: 'La sucursal no existe.' });
        }

        let total = 0;
        const detalle = [];

        // Ordenar IDs evita bloqueos en orden diferente cuando coinciden varios pedidos.
        const ids = [...cantidades.keys()].sort((a, b) => a - b);

        for (const productoId of ids) {
            const cantidad = cantidades.get(productoId);

            const consulta = await cliente.query(
                `SELECT p.id, p.nombre, p.precio_venta, i.stock
                 FROM productos p
                 JOIN inventario i ON i.producto_id = p.id
                 WHERE p.id = $1
                   AND i.sucursal_id = $2
                   AND p.activo = TRUE
                 FOR UPDATE OF i`,
                [productoId, Number(sucursal_id)]
            );

            if (!consulta.rowCount) {
                throw Object.assign(
                    new Error(`El producto ${productoId} no está disponible en esa sucursal.`),
                    { status: 400 }
                );
            }

            const producto = consulta.rows[0];
            const stock = Number(producto.stock);
            const precio = Number(producto.precio_venta);

            if (stock < cantidad) {
                throw Object.assign(
                    new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${stock}.`),
                    { status: 409 }
                );
            }

            const subtotal = Math.round(precio * cantidad * 100) / 100;
            total = Math.round((total + subtotal) * 100) / 100;

            detalle.push({
                producto_id: producto.id,
                cantidad,
                precio_unitario: precio,
                subtotal
            });
        }

        const pedido = await cliente.query(
            `INSERT INTO pedidos (usuario_id, sucursal_id, total)
             VALUES ($1, $2, $3)
             RETURNING id, usuario_id, sucursal_id, fecha, estado, total`,
            [Number(req.usuario.sub), Number(sucursal_id), total]
        );

        for (const item of detalle) {
            await cliente.query(
                `INSERT INTO pedido_detalle
                    (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    pedido.rows[0].id,
                    item.producto_id,
                    item.cantidad,
                    item.precio_unitario,
                    item.subtotal
                ]
            );

            await cliente.query(
                `UPDATE inventario
                 SET stock = stock - $1
                 WHERE producto_id = $2 AND sucursal_id = $3`,
                [item.cantidad, item.producto_id, Number(sucursal_id)]
            );
        }

        await cliente.query('COMMIT');
        transaccionAbierta = false;

        res.status(201).json({
            mensaje: 'Pedido registrado y stock actualizado.',
            pedido: pedido.rows[0],
            detalle
        });
    } catch (error) {
        if (transaccionAbierta) {
            await cliente.query('ROLLBACK');
        }

        if (error.status) {
            return res.status(error.status).json({ mensaje: error.message });
        }

        manejarError(res, error, 'No se pudo registrar el pedido.');
    } finally {
        cliente.release();
    }
});

// ---------- RESUMEN ADMINISTRATIVO ----------

app.get('/api/admin/resumen', autenticar, soloAdmin, async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente' AND activo = TRUE)::INTEGER
                    AS total_clientes,
                (SELECT COUNT(*) FROM productos WHERE activo = TRUE)::INTEGER
                    AS total_productos,
                (SELECT COUNT(*) FROM pedidos)::INTEGER AS total_pedidos,
                (SELECT COALESCE(SUM(stock), 0) FROM inventario)::INTEGER
                    AS unidades_en_stock,
                (SELECT COALESCE(SUM(total), 0) FROM pedidos
                 WHERE estado <> 'cancelado') AS ventas_registradas`
        );

        res.json(resultado.rows[0]);
    } catch (error) {
        manejarError(res, error, 'No se pudo generar el resumen administrativo.');
    }
});

// ---------- ERRORES Y ARRANQUE ----------

app.use((req, res) => {
    res.status(404).json({
        mensaje: `Ruta no encontrada: ${req.method} ${req.path}`
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

const servidor = app.listen(PORT, () => {
    console.log(`FerreArmijos API disponible en http://localhost:${PORT}`);
});

async function cerrarServidor() {
    servidor.close();
    await pool.end();
}

process.on('SIGINT', () => {
    cerrarServidor().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
    cerrarServidor().finally(() => process.exit(0));
});