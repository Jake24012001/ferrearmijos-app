-- =====================================================================
--  FERREARMIJOS - Base de datos completa (PostgreSQL)
--  11 tablas: roles, sucursales, usuarios, categorias, proveedores,
--             productos, inventario, clientes, pedidos, pedido_detalle,
--             movimientos_inventario
--
--  ATENCION: este script BORRA y vuelve a crear estas tablas.
--  Ejecutalo en una base de datos nueva/vacia.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- para cifrar contraseñas (bcrypt)

-- ---------------------------------------------------------------------
--  LIMPIEZA (orden inverso a las dependencias)
-- ---------------------------------------------------------------------
DROP VIEW  IF EXISTS v_ventas_por_dia        CASCADE;
DROP VIEW  IF EXISTS v_stock_bajo            CASCADE;
DROP VIEW  IF EXISTS v_inventario_detalle    CASCADE;
DROP TABLE IF EXISTS movimientos_inventario  CASCADE;
DROP TABLE IF EXISTS pedido_detalle          CASCADE;
DROP TABLE IF EXISTS pedidos                 CASCADE;
DROP TABLE IF EXISTS clientes                CASCADE;
DROP TABLE IF EXISTS inventario              CASCADE;
DROP TABLE IF EXISTS productos               CASCADE;
DROP TABLE IF EXISTS proveedores             CASCADE;
DROP TABLE IF EXISTS categorias              CASCADE;
DROP TABLE IF EXISTS usuarios                CASCADE;
DROP TABLE IF EXISTS sucursales              CASCADE;
DROP TABLE IF EXISTS roles                   CASCADE;
DROP FUNCTION IF EXISTS set_updated_at()     CASCADE;

-- ---------------------------------------------------------------------
--  FUNCION: actualiza automaticamente la columna updated_at
-- ---------------------------------------------------------------------
CREATE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
--  1. ROLES
-- =====================================================================
CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion VARCHAR(200)
);

-- =====================================================================
--  2. SUCURSALES
-- =====================================================================
CREATE TABLE sucursales (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL UNIQUE,
  direccion  VARCHAR(200),
  ciudad     VARCHAR(100),
  telefono   VARCHAR(20),
  activa     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================================
--  3. USUARIOS
-- =====================================================================
CREATE TABLE usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id        INTEGER      NOT NULL REFERENCES roles(id)      ON UPDATE CASCADE ON DELETE RESTRICT,
  sucursal_id   INTEGER               REFERENCES sucursales(id) ON UPDATE CASCADE ON DELETE SET NULL,
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_usuarios_email CHECK (email LIKE '%_@_%._%')
);

-- =====================================================================
--  4. CATEGORIAS
-- =====================================================================
CREATE TABLE categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(200),
  activa      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- =====================================================================
--  5. PROVEEDORES
-- =====================================================================
CREATE TABLE proveedores (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  ruc        VARCHAR(13)  UNIQUE,
  telefono   VARCHAR(20),
  email      VARCHAR(150),
  direccion  VARCHAR(200),
  activo     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================================
--  6. PRODUCTOS  (catalogo; el stock vive en la tabla inventario)
-- =====================================================================
CREATE TABLE productos (
  id            SERIAL PRIMARY KEY,
  codigo        VARCHAR(30)  NOT NULL UNIQUE,
  nombre        VARCHAR(150) NOT NULL,
  descripcion   VARCHAR(300),
  categoria_id  INTEGER      NOT NULL REFERENCES categorias(id)  ON UPDATE CASCADE ON DELETE RESTRICT,
  proveedor_id  INTEGER               REFERENCES proveedores(id) ON UPDATE CASCADE ON DELETE SET NULL,
  unidad_medida VARCHAR(20)  NOT NULL DEFAULT 'unidad',
  precio_compra NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (precio_compra >= 0),
  precio_venta  NUMERIC(10,2) NOT NULL CHECK (precio_venta > 0),
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================================
--  7. INVENTARIO  (stock de cada producto en cada sucursal)
-- =====================================================================
CREATE TABLE inventario (
  id           SERIAL PRIMARY KEY,
  producto_id  INTEGER NOT NULL REFERENCES productos(id)  ON UPDATE CASCADE ON DELETE CASCADE,
  sucursal_id  INTEGER NOT NULL REFERENCES sucursales(id) ON UPDATE CASCADE ON DELETE CASCADE,
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_inventario_producto_sucursal UNIQUE (producto_id, sucursal_id)
);

-- =====================================================================
--  8. CLIENTES
-- =====================================================================
CREATE TABLE clientes (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  cedula_ruc VARCHAR(13)  UNIQUE,
  telefono   VARCHAR(20),
  email      VARCHAR(150),
  direccion  VARCHAR(200),
  activo     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================================
--  9. PEDIDOS  (cabecera de cada venta)
-- =====================================================================
CREATE TABLE pedidos (
  id            SERIAL PRIMARY KEY,
  cliente_id    INTEGER NOT NULL DEFAULT 1 REFERENCES clientes(id)   ON UPDATE CASCADE ON DELETE RESTRICT,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id)   ON UPDATE CASCADE ON DELETE RESTRICT,
  sucursal_id   INTEGER NOT NULL REFERENCES sucursales(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  estado        VARCHAR(20) NOT NULL DEFAULT 'pagado'
                CHECK (estado IN ('pendiente', 'pagado', 'anulado')),
  metodo_pago   VARCHAR(20) NOT NULL DEFAULT 'efectivo'
                CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'credito')),
  subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  iva           NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (iva >= 0),
  total         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  observaciones VARCHAR(300),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
--  10. PEDIDO_DETALLE  (productos de cada pedido)
-- =====================================================================
CREATE TABLE pedido_detalle (
  id              SERIAL PRIMARY KEY,
  pedido_id       INTEGER NOT NULL REFERENCES pedidos(id)   ON UPDATE CASCADE ON DELETE CASCADE,
  producto_id     INTEGER NOT NULL REFERENCES productos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
  descuento       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
  subtotal        NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- =====================================================================
--  11. MOVIMIENTOS_INVENTARIO  (historial: por que cambio el stock)
-- =====================================================================
CREATE TABLE movimientos_inventario (
  id             SERIAL PRIMARY KEY,
  producto_id    INTEGER NOT NULL REFERENCES productos(id)  ON UPDATE CASCADE ON DELETE RESTRICT,
  sucursal_id    INTEGER NOT NULL REFERENCES sucursales(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  usuario_id     INTEGER          REFERENCES usuarios(id)   ON UPDATE CASCADE ON DELETE SET NULL,
  pedido_id      INTEGER          REFERENCES pedidos(id)    ON UPDATE CASCADE ON DELETE SET NULL,
  tipo           VARCHAR(20) NOT NULL
                 CHECK (tipo IN ('entrada', 'salida', 'venta', 'anulacion', 'ajuste', 'traslado')),
  cantidad       INTEGER NOT NULL CHECK (cantidad <> 0),   -- positivo suma, negativo resta
  stock_anterior INTEGER NOT NULL,
  stock_nuevo    INTEGER NOT NULL,
  motivo         VARCHAR(200),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
--  TRIGGERS (updated_at automatico)
-- =====================================================================
CREATE TRIGGER trg_usuarios_updated   BEFORE UPDATE ON usuarios   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_productos_updated  BEFORE UPDATE ON productos  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inventario_updated BEFORE UPDATE ON inventario FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
--  INDICES
-- =====================================================================
CREATE INDEX idx_productos_nombre      ON productos (nombre);
CREATE INDEX idx_productos_categoria   ON productos (categoria_id);
CREATE INDEX idx_inventario_sucursal   ON inventario (sucursal_id);
CREATE INDEX idx_pedidos_fecha         ON pedidos (created_at);
CREATE INDEX idx_pedidos_usuario       ON pedidos (usuario_id);
CREATE INDEX idx_pedidos_cliente       ON pedidos (cliente_id);
CREATE INDEX idx_pedidos_sucursal      ON pedidos (sucursal_id);
CREATE INDEX idx_detalle_pedido        ON pedido_detalle (pedido_id);
CREATE INDEX idx_detalle_producto      ON pedido_detalle (producto_id);
CREATE INDEX idx_movimientos_producto  ON movimientos_inventario (producto_id, sucursal_id);
CREATE INDEX idx_movimientos_fecha     ON movimientos_inventario (created_at);

-- =====================================================================
--  VISTAS (consultas listas para reportes y el frontend)
-- =====================================================================

-- Stock de cada producto por sucursal
CREATE VIEW v_inventario_detalle AS
SELECT i.id,
       p.id           AS producto_id,
       p.codigo,
       p.nombre       AS producto,
       c.nombre       AS categoria,
       s.id           AS sucursal_id,
       s.nombre       AS sucursal,
       i.stock,
       i.stock_minimo,
       p.precio_venta
FROM inventario i
JOIN productos  p ON p.id = i.producto_id
JOIN categorias c ON c.id = p.categoria_id
JOIN sucursales s ON s.id = i.sucursal_id
WHERE p.activo = TRUE;

-- Productos que hay que reponer
CREATE VIEW v_stock_bajo AS
SELECT * FROM v_inventario_detalle
WHERE stock <= stock_minimo
ORDER BY stock ASC;

-- Ventas agrupadas por dia y sucursal (no cuenta anuladas)
CREATE VIEW v_ventas_por_dia AS
SELECT DATE(pe.created_at) AS fecha,
       s.nombre            AS sucursal,
       COUNT(*)            AS cantidad_pedidos,
       SUM(pe.total)       AS total_vendido
FROM pedidos pe
JOIN sucursales s ON s.id = pe.sucursal_id
WHERE pe.estado <> 'anulado'
GROUP BY DATE(pe.created_at), s.nombre
ORDER BY fecha DESC;

-- =====================================================================
--  DATOS INICIALES
-- =====================================================================

INSERT INTO roles (nombre, descripcion) VALUES
  ('admin',     'Acceso total al sistema'),
  ('vendedor',  'Registra ventas y consulta productos'),
  ('bodeguero', 'Administra inventario y recepcion de mercaderia');

INSERT INTO sucursales (nombre, direccion, ciudad, telefono) VALUES
  ('Matriz',         'Av. Principal y Calle 1', 'Machala', '072000001'),
  ('Sucursal Norte', 'Av. Norte y Calle 5',     'Machala', '072000002');

-- Contraseñas:  admin123 / vendedor123 / bodega123  (cifradas con bcrypt)
INSERT INTO usuarios (nombre, email, password_hash, rol_id, sucursal_id) VALUES
  ('Administrador', 'admin@ferrearmijos.com',     crypt('admin123',    gen_salt('bf', 10)), 1, 1),
  ('Vendedor Matriz','vendedor@ferrearmijos.com', crypt('vendedor123', gen_salt('bf', 10)), 2, 1),
  ('Bodeguero',     'bodega@ferrearmijos.com',    crypt('bodega123',   gen_salt('bf', 10)), 3, 1);

INSERT INTO categorias (nombre, descripcion) VALUES
  ('Herramientas',  'Herramientas manuales y electricas'),
  ('Fijacion',      'Clavos, tornillos, pernos y anclajes'),
  ('Construccion',  'Cemento, varillas y materiales de obra'),
  ('Pinturas',      'Pinturas, brochas y accesorios'),
  ('Electricidad',  'Cables, focos e interruptores'),
  ('Plomeria',      'Tuberias, llaves y accesorios');

INSERT INTO proveedores (nombre, ruc, telefono, email) VALUES
  ('Distribuidora Herrera',      '0990000001001', '042000111', 'ventas@herrera.com'),
  ('Importadora Ferretera Sur',  '0990000002001', '072000222', 'contacto@ferrasur.com'),
  ('Materiales del Pacifico',    '0990000003001', '042000333', 'pedidos@pacifico.com');

-- Cliente 1 = consumidor final (se usa por defecto en los pedidos)
INSERT INTO clientes (nombre, cedula_ruc, telefono) VALUES
  ('Consumidor final',   '9999999999999', NULL),
  ('Constructora Andina','0991234567001', '0991112233'),
  ('Juan Perez',         '0701234567',    '0987654321');

INSERT INTO productos (codigo, nombre, categoria_id, proveedor_id, unidad_medida, precio_compra, precio_venta) VALUES
  ('HER-001', 'Martillo de acero 16 oz',      1, 1, 'unidad', 5.50,  8.50),
  ('HER-002', 'Destornillador plano',         1, 1, 'unidad', 1.60,  2.75),
  ('HER-003', 'Cinta metrica 5 m',            1, 1, 'unidad', 2.80,  4.30),
  ('HER-004', 'Alicate universal 8 pulgadas', 1, 2, 'unidad', 4.20,  6.90),
  ('FIJ-001', 'Clavos 2 pulgadas',            2, 2, 'libra',  0.70,  1.20),
  ('FIJ-002', 'Tornillos autorroscantes x100',2, 2, 'caja',   2.10,  3.40),
  ('CON-001', 'Cemento 50 kg',                3, 3, 'saco',   7.90,  9.80),
  ('CON-002', 'Varilla corrugada 10 mm',      3, 3, 'unidad', 5.60,  7.25),
  ('PIN-001', 'Pintura blanca 1 galon',       4, 1, 'galon', 16.50, 22.00),
  ('PIN-002', 'Brocha 3 pulgadas',            4, 1, 'unidad', 1.70,  2.90),
  ('ELE-001', 'Cable electrico #12',          5, 2, 'metro',  0.50,  0.85),
  ('ELE-002', 'Foco LED 12 W',                5, 2, 'unidad', 1.30,  2.10),
  ('PLO-001', 'Tubo PVC 1/2 pulgada 6 m',     6, 3, 'unidad', 3.20,  5.10),
  ('PLO-002', 'Llave de paso 1/2 pulgada',    6, 3, 'unidad', 3.60,  5.80);

-- Inventario inicial: Matriz con el stock completo, Sucursal Norte con la mitad
INSERT INTO inventario (producto_id, sucursal_id, stock, stock_minimo)
SELECT p.id,
       s.id,
       CASE WHEN s.id = 1 THEN v.stock ELSE v.stock / 2 END,
       v.minimo
FROM (VALUES
  ('HER-001',  25,  5), ('HER-002',  40,  8), ('HER-003',   3,  5), ('HER-004',  18,  5),
  ('FIJ-001', 100, 20), ('FIJ-002',  50, 10), ('CON-001',  60, 15), ('CON-002',  45, 10),
  ('PIN-001',  12,  4), ('PIN-002',  30,  6), ('ELE-001', 200, 50), ('ELE-002',  70, 15),
  ('PLO-001',  35,  8), ('PLO-002',  22,  5)
) AS v(codigo, stock, minimo)
JOIN productos  p ON p.codigo = v.codigo
CROSS JOIN sucursales s;

-- Historial: se registra el stock inicial como una entrada
INSERT INTO movimientos_inventario
  (producto_id, sucursal_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo)
SELECT producto_id, sucursal_id, 1, 'entrada', stock, 0, stock, 'Stock inicial'
FROM inventario
WHERE stock > 0;

-- =====================================================================
--  VERIFICACION
-- =====================================================================
SELECT 'roles' AS tabla, COUNT(*) AS registros FROM roles
UNION ALL SELECT 'sucursales',             COUNT(*) FROM sucursales
UNION ALL SELECT 'usuarios',               COUNT(*) FROM usuarios
UNION ALL SELECT 'categorias',             COUNT(*) FROM categorias
UNION ALL SELECT 'proveedores',            COUNT(*) FROM proveedores
UNION ALL SELECT 'clientes',               COUNT(*) FROM clientes
UNION ALL SELECT 'productos',              COUNT(*) FROM productos
UNION ALL SELECT 'inventario',             COUNT(*) FROM inventario
UNION ALL SELECT 'movimientos_inventario', COUNT(*) FROM movimientos_inventario;
