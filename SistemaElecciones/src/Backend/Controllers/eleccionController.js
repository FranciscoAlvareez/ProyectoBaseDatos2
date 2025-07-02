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

export const createElection = async (req, res) => {
  const { nombre, fecha, tipo } = req.body;

  try {
    await db.execute(`
      INSERT INTO ELECCION (nombre, fecha, tipo, estado)
      VALUES (?, ?, ?, 'inactiva')
    `, [nombre, fecha, tipo]);

    res.status(201).json({ message: "Elección creada correctamente" });
  } catch (err) {
    console.error("Error al crear elección:", err);
    res.status(500).json({ message: "Error interno al crear elección" });
  }
};
