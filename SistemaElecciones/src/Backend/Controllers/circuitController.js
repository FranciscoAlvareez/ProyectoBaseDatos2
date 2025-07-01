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
    C.nombre AS candidato,
    C.apellido_paterno AS candidato_apellido,
    L.credencial_candidato,
    V.en_blanco,
    V.es_valido,
    COUNT(*) AS votos
FROM VOTO V
LEFT JOIN LISTA L ON V.nro_lista = L.numero
LEFT JOIN PARTIDO P ON L.id_partido = P.id
LEFT JOIN CANDIDATO CAND ON L.credencial_candidato = CAND.credencial_candidato
LEFT JOIN CIUDADANO C ON CAND.credencial_candidato = C.credencial
WHERE V.id_circuito = ?
GROUP BY P.nombre, L.nombre, C.nombre, L.credencial_candidato, V.en_blanco, V.es_valido
ORDER BY 
    CASE 
        WHEN V.es_valido = 0 THEN 3
        WHEN V.en_blanco = 1 THEN 2
        ELSE 1
    END,
    P.nombre, L.nombre, C.nombre
    `,
      [id]
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener resultados");
  }
};
