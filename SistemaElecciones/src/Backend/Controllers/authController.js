import db from "../Config/db.js";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  const { credencial, password } = req.body;

  try {
    const [rows] = await db.execute(
      `SELECT U.credencial, U.contraseña, R.nombre AS rol 
       FROM USUARIOS U 
       JOIN USUARIO_ROL UR ON U.credencial = UR.credencial 
       JOIN ROL R ON UR.id_rol = R.id 
       WHERE U.credencial = ?`,
      [credencial]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const usuario = rows[0];

    const passwordCorrecta = await bcrypt.compare(password, usuario.contraseña);
    if (!passwordCorrecta) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    let circuito = null;
    let establecimiento = null;

    // Si NO es admin, traer circuito y establecimiento
    if (usuario.rol !== "admin") {
      const [hab] = await db.execute(
        `SELECT id_circuito, id_establecimiento
         FROM HABILITADO_A_VOTAR
         WHERE credencial_habilitado = ?`,
        [usuario.credencial]
      );

      if (hab.length > 0) {
        circuito = hab[0].id_circuito;
        establecimiento = hab[0].id_establecimiento;
      }
    }

    res.status(200).json({
      mensaje: "Login exitoso",
      credencial: usuario.credencial,
      rol: usuario.rol,
      id_circuito: circuito,
      id_establecimiento: establecimiento
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
