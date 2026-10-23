
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { pool } from './src/database';

async function main(): Promise<void> {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const nombre = (await rl.question('Nombre del administrador: ')).trim();
    const email = (await rl.question('Correo del administrador: '))
      .trim()
      .toLowerCase();
    const password = await rl.question(
      'Contraseña (mínimo 12 caracteres): '
    );

    if (!nombre || nombre.length > 100) {
      throw new Error('El nombre es obligatorio y no debe superar 100 caracteres.');
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 150
    ) {
      throw new Error('El correo no es válido.');
    }

    if (password.length < 12) {
      throw new Error('La contraseña debe tener al menos 12 caracteres.');
    }

    const hash = await bcrypt.hash(password, 12);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING
       RETURNING id, nombre, email, rol`,
      [nombre, email, hash]
    );

    if (resultado.rowCount === 0) {
      console.log(
        'Ese correo ya existe. No se cambió su contraseña ni su rol.'
      );
    } else {
      console.log('Administrador creado correctamente:');
      console.table(resultado.rows[0]);
    }
  } finally {
    rl.close();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : 'Error desconocido';
  console.error('No se pudo crear el administrador:', mensaje);
  process.exitCode = 1;
});
