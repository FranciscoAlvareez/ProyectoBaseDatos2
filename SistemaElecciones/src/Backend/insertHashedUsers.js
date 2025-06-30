import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import db from "./Config/db.js";

// Lista de usuarios con credencial, contraseña y rol
const usuarios = [
  {
    credencial: "OBB 30452",
    contraseña: "30452",
    idRol: 1 // admin
  },
  {
    credencial: "ABC 12345",
    contraseña: "12345",
    idRol: 2 // gestor
  },
  {
    credencial: "OBC 43256",
    contraseña: "43256",
    idRol: 3 // ciudadano
  }
];

const insertarUsuarioConRol = async ({ credencial, contraseña, idRol }) => {
  try {
    const hash = await bcrypt.hash(contraseña, 10);

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
  for (const usuario of usuarios) {
    await insertarUsuarioConRol(usuario);
  }

  process.exit(); // cerrar conexión
};

run();
