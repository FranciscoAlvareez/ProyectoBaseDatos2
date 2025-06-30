import db from "../Config/db.js";

export const obtenerEleccionActiva = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id_eleccion, nombre, fecha, tipo
       FROM ELECCION
       WHERE estado = 'activa'`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay elección activa en este momento." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error al obtener elección activa:", err);
    res.status(500).json({ message: "Error interno al obtener elección activa." });
  }
};
