import db from "../Config/db.js";
import bcrypt from "bcrypt";

export const registerVoter = async (req, res) => {
  const {
    credencial,
    ci,
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nac,
    contraseña
  } = req.body;

  try {
    // 1. Insertar ciudadano
    await db.execute(`
      INSERT INTO CIUDADANO (
        credencial, ci, fecha_nac, nombre, apellido_paterno, apellido_materno
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [credencial, ci, fecha_nac, nombre, apellido_paterno, apellido_materno]);

    // 2. Hashear la contraseña
    const hash = await bcrypt.hash(contraseña, 10);

    // 3. Insertar en USUARIOS
    await db.execute(`
      INSERT INTO USUARIOS (credencial, contraseña)
      VALUES (?, ?)
    `, [credencial, hash]);

    // 4. Insertar rol por defecto: ciudadano (id_rol = 3)
    await db.execute(`
      INSERT INTO USUARIO_ROL (credencial, id_rol)
      VALUES (?, 3)
    `, [credencial]);

    res.status(201).json({ message: "Ciudadano registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar ciudadano:", error);
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
