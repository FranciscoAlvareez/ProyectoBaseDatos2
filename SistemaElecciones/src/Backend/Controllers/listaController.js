import db from "../Config/db.js";

export const createLista = async (req, res) => {
  const { numero, credencial_candidato, id_partido, nombre } = req.body;

  try {
    // Verificar si el candidato ya existe
    const [candRows] = await db.execute(
      `SELECT * FROM CANDIDATO WHERE credencial_candidato = ?`,
      [credencial_candidato]
    );

    if (candRows.length === 0) {
      // Insertar candidato si no existe
      await db.execute(
        `INSERT INTO CANDIDATO (credencial_candidato) VALUES (?)`,
        [credencial_candidato]
      );
    }

    // Insertar lista
    await db.execute(
      `INSERT INTO LISTA (numero, credencial_candidato, id_partido, nombre)
       VALUES (?, ?, ?, ?)`,
      [numero, credencial_candidato, id_partido, nombre]
    );

    res.status(201).json({ message: "Lista creada correctamente" });

  } catch (err) {
    console.error("Error al crear lista:", err);
    res.status(500).json({ message: "Error interno al crear lista" });
  }
};

export const getPartidos = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM PARTIDO`);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error al obtener partidos:", err);
    res.status(500).json({ message: "Error interno al obtener partidos" });
  }
};
