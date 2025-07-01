// controllers/circuitController.js
import pool from "../Config/db.js";

export const getCircuitsByEstablecimiento = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "SELECT * FROM CIRCUITO WHERE id_establecimiento = ?",
      [id]
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener circuitos");
  }
};

export const getResultadosByCircuito = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `
      SELECT 
        P.nombre AS partido,
        L.nombre AS lista,
        COUNT(*) AS votos
      FROM VOTO V
      LEFT JOIN LISTA L ON V.nro_lista = L.numero
      LEFT JOIN PARTIDO P ON L.id_partido = P.id
      WHERE V.id_circuito = ?
      GROUP BY P.nombre, L.nombre WITH ROLLUP
    `,
      [id]
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener resultados");
  }
};
