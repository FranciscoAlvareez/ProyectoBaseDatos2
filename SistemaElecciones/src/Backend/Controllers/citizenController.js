import db from "../Config/db.js";

// Obtenemos ciudadanos que no están en HABILITADO_A_VOTAR
export const getUnassignedCitizens = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT C.credencial, C.nombre
      FROM CIUDADANO C
      WHERE C.credencial NOT IN (
        SELECT credencial_habilitado FROM HABILITADO_A_VOTAR
      )
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener ciudadanos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Insertar un HABILITADO_A_VOTAR
export const assignCitizenToCircuit = async (req, res) => {
  const { credencial, id_circuito } = req.body;

  try {
    await db.execute(`
      INSERT INTO HABILITADO_A_VOTAR (credencial_habilitado, id_circuito)
      VALUES (?, ?)
    `, [credencial, id_circuito]);

    res.status(201).json({ message: "Asignación realizada con éxito" });
  } catch (error) {
    console.error("Error al asignar votante:", error);
    res.status(500).json({ message: "Error al asignar ciudadano" });
  }
};

