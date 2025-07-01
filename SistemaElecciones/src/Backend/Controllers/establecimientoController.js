import db from "../Config/db.js";

export const getEstablecimientos = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT nombre_establecimiento
      FROM ESTABLECIMIENTO
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener establecimientos:", error);
    res.status(500).json({ message: "Error al obtener establecimientos" });
  }
};
