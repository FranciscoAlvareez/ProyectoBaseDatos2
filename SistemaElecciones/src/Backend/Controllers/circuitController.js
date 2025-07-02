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
  const { idCircuito, idEstablecimiento } = req.params;
  try {
    const [result] = await pool.query(
      `
      SELECT 
        P.id AS id_partido,
        P.nombre AS partido,
        L.numero AS nro_lista,
        L.nombre AS lista,
        C.nombre AS candidato,
        C.apellido_paterno AS candidato_apellido,
        L.credencial_candidato,
        V.en_blanco,
        V.anulado,
        COUNT(*) AS votos
      FROM VOTO V
      LEFT JOIN LISTA L ON V.nro_lista = L.numero
      LEFT JOIN PARTIDO P ON L.id_partido = P.id
      LEFT JOIN CANDIDATO CAND ON L.credencial_candidato = CAND.credencial_candidato
      LEFT JOIN CIUDADANO C ON CAND.credencial_candidato = C.credencial
      WHERE V.id_circuito = ? AND V.id_establecimiento = ?
      GROUP BY P.id, P.nombre, L.numero, L.nombre, C.nombre, L.credencial_candidato, V.en_blanco, V.anulado
      ORDER BY 
          CASE 
              WHEN V.anulado = 1 THEN 3
              WHEN V.en_blanco = 1 THEN 2
              ELSE 1
          END,
          P.nombre, L.nombre, C.nombre
      `,
      [idCircuito, idEstablecimiento]
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener resultados");
  }
};

export const getResultadosGlobales = async (req, res) => {
  try {
    const [result] = await pool.query(
      `
      WITH votos_por_partido AS (
        SELECT 
            P.nombre AS partido,
            P.id AS id_partido,
            SUM(CASE WHEN V.anulado = 0 AND V.en_blanco = 0 THEN 1 ELSE 0 END) AS votos_validos
        FROM VOTO V
        LEFT JOIN LISTA L ON V.nro_lista = L.numero
        LEFT JOIN PARTIDO P ON L.id_partido = P.id
        WHERE V.anulado = 0 AND V.en_blanco = 0 AND P.nombre IS NOT NULL
        GROUP BY P.id, P.nombre
    ),
    votos_en_blanco_total AS (
        SELECT COUNT(*) AS total_votos_blanco
        FROM VOTO
        WHERE anulado = 0 AND en_blanco = 1
    ),
    partido_ganador AS (
        SELECT id_partido
        FROM votos_por_partido
        ORDER BY votos_validos DESC
        LIMIT 1
    )
    SELECT 
        vpp.partido,
        vpp.id_partido,
        vpp.votos_validos,
        CASE 
            WHEN vpp.id_partido = pg.id_partido THEN vbt.total_votos_blanco 
            ELSE 0 
        END AS votos_en_blanco,
        CASE 
            WHEN vpp.id_partido = pg.id_partido THEN vpp.votos_validos + vbt.total_votos_blanco 
            ELSE vpp.votos_validos 
        END AS votos_totales,
        CASE 
            WHEN vpp.id_partido = pg.id_partido THEN 1 
            ELSE 0 
        END AS es_ganador
    FROM votos_por_partido vpp
    CROSS JOIN votos_en_blanco_total vbt
    CROSS JOIN partido_ganador pg
    ORDER BY votos_validos DESC;
      `
    );

    if (result.length === 0) {
      return res.json([]);
    }

    // Procesamos los resultados
    const resultadosFinales = result.map((partido, index) => ({
      partido: partido.partido,
      id_partido: partido.id_partido,
      votos_validos: parseInt(partido.votos_validos) || 0,
      votos_en_blanco: index === 0 ? parseInt(partido.votos_en_blanco) || 0 : 0,
      votos_totales:
        index === 0
          ? (parseInt(partido.votos_validos) || 0) +
            (parseInt(partido.votos_en_blanco) || 0)
          : parseInt(partido.votos_validos) || 0,
      es_ganador: index === 0,
    }));

    res.json(resultadosFinales);
  } catch (err) {
    console.error("Error al obtener resultados globales:", err);
    res.status(500).send("Error al obtener resultados globales");
  }
};
