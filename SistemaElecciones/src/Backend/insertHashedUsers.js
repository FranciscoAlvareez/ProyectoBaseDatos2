import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import db from "./Config/db.js";

const insertarUsuarioCompleto = async ({ credencial, contraseña, idRol, nombre, apellido }) => {
  try {
    const hash = await bcrypt.hash(contraseña, 10);

    // Insertar en CIUDADANO
    await db.execute(
      "INSERT INTO CIUDADANO (credencial, ci, fecha_nac, nombre, apellido_paterno, apellido_materno) VALUES (?, ?, ?, ?, ?, ?)",
      [credencial, contraseña, "2000-01-01", nombre, apellido, "Test"]
    );

    // Insertar en USUARIOS
    await db.execute(
      "INSERT INTO USUARIOS (credencial, contraseña) VALUES (?, ?)",
      [credencial, hash]
    );

    // Insertar en USUARIO_ROL
    await db.execute(
      "INSERT INTO USUARIO_ROL (credencial, id_rol) VALUES (?, ?)",
      [credencial, idRol]
    );

    console.log(`Usuario ${credencial} insertado con rol ${idRol}`);
  } catch (err) {
    console.error(`Error con ${credencial}:`, err.message);
  }
};

const run = async () => {
  // Insertar admin
  await insertarUsuarioCompleto({
    credencial: "ADM 10000",
    contraseña: "10000",
    idRol: 1,
    nombre: "Admin",
    apellido: "Sistema"
  });

  // Insertar 20 gestores
  for (let i = 1; i <= 20; i++) {
    const numero = 20000 + i;
    await insertarUsuarioCompleto({
      credencial: `GST ${numero}`,
      contraseña: `${numero}`,
      idRol: 2,
      nombre: `Gestor${i}`,
      apellido: `ApellidoG${i}`
    });
  }

  // Insertar 50 ciudadanos
  for (let i = 1; i <= 50; i++) {
    const numero = 30000 + i;
    await insertarUsuarioCompleto({
      credencial: `CID ${numero}`,
      contraseña: `${numero}`,
      idRol: 3,
      nombre: `Ciudadano${i}`,
      apellido: `ApellidoC${i}`
    });
  }

  process.exit();
};

run();
