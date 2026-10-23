import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productosRoutes from './Routes/productos.routes';
import usuariosRoutes from './Routes/usuarios.routes';
import ventasRoutes from './Routes/ventas.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ventas', ventasRoutes);

app.get('/', (_req, res) => {
  res.json({ mensaje: 'API FerreArmijos funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});