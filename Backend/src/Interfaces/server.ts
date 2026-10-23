import 'dotenv/config';
import express, {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler
} from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './database';
import type {
  AuthRequest,
  TokenPayload,
  ProductoInput,
  PedidoInput
} from './types';
import { validarProducto, esEnteroPositivo } from './validaciones';

if (!process.env.JWT_SECRET) {
  throw new Error('Falta configurar JWT_SECRET en el archivo .env');
}

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = Number(process.env.PORT ?? 3000);
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:4200'
}));
app.use(express.json({ limit: '100kb' }));

// ---------- FUNCIONES AUXILIARES ----------

function responderError(
  res: Response,
  error: unknown,
  mensaje: string
): void {
  const err = error as { code?: string; message?: string };
  console.error(error);

  if (err.code === '23505') {
    res.status(409).json({
      mensaje: 'Ya existe un registro con ese código o correo.'
    });
    return;
  }

  if (err.code === '23503') {
    res.status(400).json({
      mensaje: 'El registro relacionado no existe.'
    });
    return;
  }

  res.status(500).json({ mensaje });
}

// ---------- AUTENTICACIÓN Y ROLES ----------

const autenticar: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const cabecera = req.headers.authorization;

  if (!cabecera?.startsWith('Bearer ')) {
    res.status(401).json({
      mensaje: 'Debe iniciar sesión para continuar.'
    });
    return;
  }

  try {
    const token = cabecera.substring(7);
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (
      typeof payload.sub !== 'string' ||
      (payload.rol !== 'admin' && payload.rol !== 'cliente')
    ) {
      res.status(401).json({ mensaje: 'Token inválido.' });
      return;
    }

    (req as AuthRequest).usuario = {
      sub: payload.sub,
      rol: payload.rol
    };

    next();
  } catch {
    res.status(401).json({
      mensaje: 'Token inválido o vencido. Inicie sesión nuevamente.'
    });
  }
};

const soloAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const usuario = (req as AuthRequest).usuario;

  if (!usuario || usuario.rol !== 'admin') {
    res.status(403).json({
      mensaje: 'No tiene permisos de administrador.'
    });
    return;
  }

  next();
};

// ---------- ESTADO DE LA API ----------

app.get('/api/bd', async (_req: Request, res: Response) => {
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
      mensaje: 'No se pudo conectar con PostgreSQL.'
    });
  }
});

// ---------- REGISTRO DE CLIENTES ----------

app.post('/api/auth/registro', async (req: Request, res: Response) => {
  try {
    const { nombre, email, password } = req.body as {
      nombre?: unknown;
      email?: unknown;
      password?: unknown;
    };

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
      res.status(400).json({
        mensaje: 'Ingrese un nombre y correo válidos y una contraseña de al menos 12 caracteres.'
      });
      return;
    }

    const hash = await bcrypt.hash(password, 12);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, LOWER($2), $3, 'cliente')
       RETURNING id, nombre, email, rol`,
      [nombre.trim(), email.trim(), hash]
    );

    res.status(201).json({
      mensaje: 'Cuenta de cliente creada correctamente.',
      usuario: resultado.rows[0]
    });
  } catch (error) {
    responderError(res, error, 'No se pudo registrar el usuario.');
  }
});

// ---------- INICIO DE SESIÓN ----------

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: unknown;
      password?: unknown;
    };

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        mensaje: 'El correo y la contraseña son obligatorios.'
      });
      return;
    }

    const resultado = await pool.query(
      `SELECT id, nombre, email, password_hash, rol
       FROM usuarios
       WHERE email = LOWER($1) AND activo = TRUE`,
      [email.trim()]
    );

    if (resultado.rowCount === 0) {
      res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      });
      return;
    }

    const usuario = resultado.rows[0] as {
      id: number;
      nombre: string;
      email: string;
      password_hash: string;
      rol: 'admin' | 'cliente';
    };

    const coincide = await bcrypt.compare(password, usuario.password_hash);

    if (!coincide) {
      res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      });
      return;
    }

    const payload: TokenPayload = {
      sub: String(usuario.id),
      rol: usuario.rol
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    res.json({
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
    responderError(res, error, 'No se pudo iniciar sesión.');
  }
});

// ---------- PERFIL DEL USUARIO ----------

app.get(
  '/api/auth/perfil',
  autenticar,
  async (req: Request, res: Response) => {
    try {
      const usuario = (req as AuthRequest).usuario!;

      const resultado = await pool.query(
        `SELECT id, nombre, email, rol
         FROM usuarios
         WHERE id = $1 AND activo = TRUE`,
        [usuario.sub]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({
          mensaje: 'Usuario no encontrado o inactivo.'
        });
        return;
      }

      res.json({ usuario: resultado.rows[0] });
    } catch (error) {
      responderError(res, error, 'No se pudo consultar el perfil.');
    }
  }
);

// ---------- SUCURSALES ----------

app.get('/api/sucursales', async (_req: Request, res: Response) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, ciudad FROM sucursales ORDER BY nombre'
    );

    res.json(resultado.rows);
  } catch (error) {
    responderError(res, error, 'No se pudieron consultar las sucursales.');
  }
});

// ---------- CATÁLOGO PÚBLICO ----------

app.get('/api/productos', async (_req: Request, res: Response) => {
  try {
    const resultado = await pool.query(
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

    // No se entrega precio_compra a los clientes.
    res.json(resultado.rows);
  } catch (error) {
    responderError(res, error, 'No se pudieron consultar los productos.');
  }
});

app.get('/api/categorias', async (_req: Request, res: Response) => {
  try {
    const resultado = await pool.query(
      `SELECT DISTINCT categoria
       FROM productos
       WHERE activo = TRUE
       ORDER BY categoria`
    );

    res.json(resultado.rows.map((fila: { categoria: string }) => fila.categoria));
  } catch (error) {
    responderError(res, error, 'No se pudieron consultar las categorías.');
  }
});

// ---------- ADMINISTRACIÓN DE PRODUCTOS ----------

app.get(
  '/api/admin/productos',
  autenticar,
  soloAdmin,
  async (_req: Request, res: Response) => {
    try {
      const resultado = await pool.query(
        `SELECT
            p.id, p.codigo, p.nombre, p.descripcion, p.categoria,
            p.precio_compra, p.precio_venta, p.activo,
            ROUND(p.precio_venta - p.precio_compra, 2) AS ganancia_unitaria,
            CASE
              WHEN p.precio_venta > 0 THEN
                ROUND(
                  ((p.precio_venta - p.precio_compra) / p.precio_venta) * 100,
                  2
                )
              ELSE 0
            END AS margen_porcentaje
         FROM productos p
         ORDER BY p.nombre`
      );

      res.json(resultado.rows);
    } catch (error) {
      responderError(res, error, 'No se pudieron consultar los productos administrativos.');
    }
  }
);

app.post(
  '/api/productos',
  autenticar,
  soloAdmin,
  async (req: Request, res: Response) => {
    try {
      const datos = req.body as ProductoInput;
      const errorValidacion = validarProducto(datos);

      if (errorValidacion) {
        res.status(400).json({ mensaje: errorValidacion });
        return;
      }

      const resultado = await pool.query(
        `INSERT INTO productos
          (codigo, nombre, descripcion, categoria, precio_compra, precio_venta)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, codigo, nombre, descripcion, categoria,
                   precio_compra, precio_venta, activo`,
        [
          datos.codigo.trim(),
          datos.nombre.trim(),
          typeof datos.descripcion === 'string' ? datos.descripcion.trim() : '',
          datos.categoria.trim(),
          Number(datos.precio_compra),
          Number(datos.precio_venta)
        ]
      );

      res.status(201).json({
        mensaje: 'Producto creado correctamente.',
        producto: resultado.rows[0]
      });
    } catch (error) {
      responderError(res, error, 'No se pudo crear el producto.');
    }
  }
);

app.put(
  '/api/productos/:id',
  autenticar,
  soloAdmin,
  async (req: Request, res: Response) => {
    try {
      if (!esEnteroPositivo(req.params.id)) {
        res.status(400).json({ mensaje: 'ID de producto inválido.' });
        return;
      }

      const datos = req.body as ProductoInput;
      const errorValidacion = validarProducto(datos);

      if (errorValidacion) {
        res.status(400).json({ mensaje: errorValidacion });
        return;
      }

      const resultado = await pool.query(
        `UPDATE productos
         SET codigo = $1, nombre = $2, descripcion = $3, categoria = $4,
             precio_compra = $5, precio_venta = $6
         WHERE id = $7 AND activo = TRUE
         RETURNING id, codigo, nombre, descripcion, categoria,
                   precio_compra, precio_venta, activo`,
        [
          datos.codigo.trim(),
          datos.nombre.trim(),
          typeof datos.descripcion === 'string' ? datos.descripcion.trim() : '',
          datos.categoria.trim(),
          Number(datos.precio_compra),
          Number(datos.precio_venta),
          Number(req.params.id)
        ]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({ mensaje: 'Producto no encontrado.' });
        return;
      }

      res.json({
        mensaje: 'Producto actualizado correctamente.',
        producto: resultado.rows[0]
      });
    } catch (error) {
      responderError(res, error, 'No se pudo actualizar el producto.');
    }
  }
);

app.delete(
  '/api/productos/:id',
  autenticar,
  soloAdmin,
  async (req: Request, res: Response) => {
    try {
      if (!esEnteroPositivo(req.params.id)) {
        res.status(400).json({ mensaje: 'ID de producto inválido.' });
        return;
      }

      const resultado = await pool.query(
        `UPDATE productos SET activo = FALSE
         WHERE id = $1 AND activo = TRUE
         RETURNING id, nombre`,
        [Number(req.params.id)]
      );

      if (resultado.rowCount === 0) {
        res.status(404).json({
          mensaje: 'Producto no encontrado o ya desactivado.'
        });
        return;
      }

      res.json({ mensaje: 'Producto desactivado correctamente.' });
    } catch (error) {
      responderError(res, error, 'No se pudo desactivar el producto.');
    }
  }
);

// ---------- INVENTARIO POR SUCURSAL ----------

app.get(
  '/api/admin/inventario',
  autenticar,
  soloAdmin,
  async (_req: Request, res: Response) => {
    try {
      const resultado = await pool.query(
        `SELECT
            i.id, p.id AS producto_id, p.codigo, p.nombre,
            s.id AS sucursal_id, s.nombre AS sucursal, s.ciudad, i.stock
         FROM inventario i
         JOIN productos p ON p.id = i.producto_id
         JOIN sucursales s ON s.id = i.sucursal_id
         ORDER BY s.nombre, p.nombre`
      );

      res.json(resultado.rows);
    } catch (error) {
      responderError(res, error, 'No se pudo consultar el inventario.');
    }
  }
);

app.put(
  '/api/admin/inventario',
  autenticar,
  soloAdmin,
  async (req: Request, res: Response) => {
    try {
      const { producto_id, sucursal_id, stock } = req.body as {
        producto_id?: unknown;
        sucursal_id?: unknown;
        stock?: unknown;
      };

      if (
        !esEnteroPositivo(producto_id) ||
        !esEnteroPositivo(sucursal_id) ||
        typeof stock !== 'number' ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        res.status(400).json({
          mensaje: 'Producto, sucursal y stock deben tener valores válidos.'
        });
        return;
      }

      const [producto, sucursal] = await Promise.all([
        pool.query(
          'SELECT id FROM productos WHERE id = $1 AND activo = TRUE',
          [Number(producto_id)]
        ),
        pool.query(
          'SELECT id FROM sucursales WHERE id = $1',
          [Number(sucursal_id)]
        )
      ]);

      if (!producto.rowCount || !sucursal.rowCount) {
        res.status(404).json({
          mensaje: 'El producto o la sucursal no existen o no están disponibles.'
        });
        return;
      }

      const resultado = await pool.query(
        `INSERT INTO inventario (producto_id, sucursal_id, stock)
         VALUES ($1, $2, $3)
         ON CONFLICT (producto_id, sucursal_id)
         DO UPDATE SET stock = EXCLUDED.stock
         RETURNING *`,
        [Number(producto_id), Number(sucursal_id), stock]
      );

      res.json({
        mensaje: 'Inventario actualizado correctamente.',
        inventario: resultado.rows[0]
      });
    } catch (error) {
      responderError(res, error, 'No se pudo actualizar el inventario.');
    }
  }
);

// ---------- PEDIDOS ----------

app.get(
  '/api/pedidos',
  autenticar,
  async (req: Request, res: Response) => {
    try {
      const usuario = (req as AuthRequest).usuario!;
      const esAdmin = usuario.rol === 'admin';

      const resultado = await pool.query(
        `SELECT
            p.id, p.fecha, p.estado, p.total,
            s.nombre AS sucursal, u.nombre AS cliente,
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
        [esAdmin, Number(usuario.sub)]
      );

      res.json(resultado.rows);
    } catch (error) {
      responderError(res, error, 'No se pudieron consultar los pedidos.');
    }
  }
);

app.post(
  '/api/pedidos',
  autenticar,
  async (req: Request, res: Response) => {
    const usuario = (req as AuthRequest).usuario!;
    const datos = req.body as PedidoInput;
    const cliente = await pool.connect();
    let transaccionAbierta = false;

    try {
      if (
        !esEnteroPositivo(datos?.sucursal_id) ||
        !Array.isArray(datos.items) ||
        datos.items.length === 0 ||
        datos.items.length > 50
      ) {
        res.status(400).json({
          mensaje: 'Seleccione una sucursal e incluya productos en el pedido.'
        });
        return;
      }

      const cantidades = new Map<number, number>();

      for (const item of datos.items) {
        if (
          !esEnteroPositivo(item?.producto_id) ||
          !esEnteroPositivo(item?.cantidad) ||
          Number(item.cantidad) > 10000
        ) {
          res.status(400).json({
            mensaje: 'Cada producto debe tener un ID y una cantidad válidos.'
          });
          return;
        }

        const id = Number(item.producto_id);
        cantidades.set(id, (cantidades.get(id) ?? 0) + Number(item.cantidad));
      }

      await cliente.query('BEGIN');
      transaccionAbierta = true;

      const sucursal = await cliente.query(
        'SELECT id FROM sucursales WHERE id = $1',
        [Number(datos.sucursal_id)]
      );

      if (sucursal.rowCount === 0) {
        await cliente.query('ROLLBACK');
        transaccionAbierta = false;
        res.status(404).json({ mensaje: 'La sucursal no existe.' });
        return;
      }

      let total = 0;
      const detalle: Array<{
        producto_id: number;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
      }> = [];

      // Bloquear el stock durante la operación para evitar ventas simultáneas
      // de las mismas unidades.
      const ids = [...cantidades.keys()].sort((a, b) => a - b);

      for (const productoId of ids) {
        const cantidad = cantidades.get(productoId)!;

        const consulta = await cliente.query(
          `SELECT p.id, p.nombre, p.precio_venta, i.stock
           FROM productos p
           JOIN inventario i ON i.producto_id = p.id
           WHERE p.id = $1
             AND i.sucursal_id = $2
             AND p.activo = TRUE
           FOR UPDATE OF i`,
          [productoId, Number(datos.sucursal_id)]
        );

        if (consulta.rowCount === 0) {
          throw Object.assign(
            new Error(`El producto ${productoId} no está disponible en esa sucursal.`),
            { status: 400 }
          );
        }

        const producto = consulta.rows[0] as {
          id: number;
          nombre: string;
          precio_venta: string | number;
          stock: number;
        };

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
          producto_id: Number(producto.id),
          cantidad,
          precio_unitario: precio,
          subtotal
        });
      }

      const pedido = await cliente.query(
        `INSERT INTO pedidos (usuario_id, sucursal_id, total)
         VALUES ($1, $2, $3)
         RETURNING id, usuario_id, sucursal_id, fecha, estado, total`,
        [Number(usuario.sub), Number(datos.sucursal_id), total]
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
          [item.cantidad, item.producto_id, Number(datos.sucursal_id)]
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

      const err = error as { status?: number; message?: string };

      if (err.status) {
        res.status(err.status).json({ mensaje: err.message });
        return;
      }

      responderError(res, error, 'No se pudo registrar el pedido.');
    } finally {
      cliente.release();
    }
  }
);

// ---------- RESUMEN ADMINISTRATIVO ----------

app.get(
  '/api/admin/resumen',
  autenticar,
  soloAdmin,
  async (_req: Request, res: Response) => {
    try {
      const resultado = await pool.query(
        `SELECT
          (SELECT COUNT(*) FROM usuarios
           WHERE rol = 'cliente' AND activo = TRUE)::INTEGER AS total_clientes,
          (SELECT COUNT(*) FROM productos
           WHERE activo = TRUE)::INTEGER AS total_productos,
          (SELECT COUNT(*) FROM pedidos)::INTEGER AS total_pedidos,
          (SELECT COALESCE(SUM(stock), 0)
           FROM inventario)::INTEGER AS unidades_en_stock,
          (SELECT COALESCE(SUM(total), 0)
           FROM pedidos WHERE estado <> 'cancelado') AS ventas_registradas`
      );

      res.json(resultado.rows[0]);
    } catch (error) {
      responderError(res, error, 'No se pudo generar el resumen administrativo.');
    }
  }
);

// ---------- RUTAS NO ENCONTRADAS ----------

app.use((req: Request, res: Response) => {
  res.status(404).json({
    mensaje: `Ruta no encontrada: ${req.method} ${req.path}`
  });
});

app.use((
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

// ---------- INICIAR Y CERRAR SERVIDOR ----------

const servidor = app.listen(PORT, () => {
  console.log(`FerreArmijos API disponible en http://localhost:${PORT}`);
});

async function cerrarServidor(): Promise<void> {
  servidor.close();
  await pool.end();
}

process.on('SIGINT', () => {
  cerrarServidor().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  cerrarServidor().finally(() => process.exit(0));
});
