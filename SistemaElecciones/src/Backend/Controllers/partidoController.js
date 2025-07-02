import db from "../Config/db.js";

export const createPartidoWithAutoridades = async (req, res) => {
  const { nombre, calle, ciudad, nro_puerta, presidente, vicepresidente } = req.body;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Insertar partido
    const [partidoResult] = await conn.execute(`
      INSERT INTO PARTIDO (nombre, calle, ciudad, nro_puerta)
      VALUES (?, ?, ?, ?)
    `, [nombre, calle, ciudad, nro_puerta]);

    const partidoId = partidoResult.insertId;

    // 2. Insertar autoridades
    await conn.execute(`
      INSERT INTO AUTORIDADES (id_partido, presidente, vicepresidente)
      VALUES (?, ?, ?)
    `, [partidoId, presidente, vicepresidente]);

    await conn.commit();

    res.status(201).json({ message: "Partido y autoridades creados correctamente", partidoId });

  } catch (err) {
    await conn.rollback();
    console.error("Error al crear partido y autoridades:", err);
    res.status(500).json({ message: "Error interno al crear partido y autoridades" });
  } finally {
    conn.release();
  }
};