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
      candidatos_por_partido AS (
        SELECT 
            P.nombre AS partido,
            P.id AS id_partido,
            L.numero AS nro_lista,
            L.nombre AS lista,
            C.nombre AS candidato,
            C.apellido_paterno AS candidato_apellido,
            L.credencial_candidato,
            COUNT(*) AS votos_candidato
        FROM VOTO V
        LEFT JOIN LISTA L ON V.nro_lista = L.numero
        LEFT JOIN PARTIDO P ON L.id_partido = P.id
        LEFT JOIN CANDIDATO CAND ON L.credencial_candidato = CAND.credencial_candidato
        LEFT JOIN CIUDADANO C ON CAND.credencial_candidato = C.credencial
        WHERE V.anulado = 0 AND V.en_blanco = 0 AND P.nombre IS NOT NULL AND C.nombre IS NOT NULL
        GROUP BY P.id, P.nombre, L.numero, L.nombre, C.nombre, C.apellido_paterno, L.credencial_candidato
      ),
      candidato_mas_votado_por_partido AS (
        SELECT 
            id_partido,
            partido,
            candidato,
            candidato_apellido,
            lista,
            votos_candidato,
            ROW_NUMBER() OVER (PARTITION BY id_partido ORDER BY votos_candidato DESC) as rn
        FROM candidatos_por_partido
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
          END AS es_ganador,
          cm.candidato,
          cm.candidato_apellido,
          cm.lista,
          cm.votos_candidato
      FROM votos_por_partido vpp
      CROSS JOIN votos_en_blanco_total vbt
      CROSS JOIN partido_ganador pg
      LEFT JOIN candidato_mas_votado_por_partido cm ON vpp.id_partido = cm.id_partido AND cm.rn = 1
      ORDER BY vpp.votos_validos DESC;
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
      candidato_principal:
        partido.candidato && partido.candidato_apellido
          ? `${partido.candidato} ${partido.candidato_apellido}`
          : partido.candidato || "Sin candidato principal",
      lista_principal: partido.lista || "Sin lista",
      votos_candidato_principal: parseInt(partido.votos_candidato) || 0,
      partido_candidato:
        partido.candidato && partido.candidato_apellido
          ? `${partido.partido} — ${partido.candidato} ${partido.candidato_apellido}`
          : partido.partido,
    }));

    res.json(resultadosFinales);
  } catch (err) {
    console.error("Error al obtener resultados globales:", err);
    res.status(500).send("Error al obtener resultados globales");
  }
};

export const getResultadosPorDepartamento = async (req, res) => {
  try {
    const [result] = await pool.query(
      `
      WITH votos_por_departamento_partido AS (
        SELECT 
            D.nombre AS departamento,
            P.nombre AS partido,
            P.id AS id_partido,
            L.numero AS nro_lista,
            L.nombre AS lista,
            C.nombre AS candidato,
            C.apellido_paterno AS candidato_apellido,
            L.credencial_candidato,
            COUNT(*) AS votos
        FROM VOTO V
        INNER JOIN CIRCUITO CIR ON V.id_circuito = CIR.id AND V.id_establecimiento = CIR.id_establecimiento
        INNER JOIN ESTABLECIMIENTO E ON CIR.id_establecimiento = E.id_establecimiento
        INNER JOIN ZONA Z ON E.cod_postal = Z.cod_postal
        INNER JOIN DEPARTAMENTO D ON Z.departamento = D.nombre
        LEFT JOIN LISTA L ON V.nro_lista = L.numero
        LEFT JOIN PARTIDO P ON L.id_partido = P.id
        LEFT JOIN CANDIDATO CAND ON L.credencial_candidato = CAND.credencial_candidato
        LEFT JOIN CIUDADANO C ON CAND.credencial_candidato = C.credencial
        WHERE V.anulado = 0 AND V.en_blanco = 0 AND P.nombre IS NOT NULL
        GROUP BY D.nombre, P.id, P.nombre, L.numero, L.nombre, C.nombre, C.apellido_paterno, L.credencial_candidato
      ),
      votos_partido_por_departamento AS (
        SELECT 
            departamento,
            partido,
            id_partido,
            SUM(votos) AS total_votos_partido
        FROM votos_por_departamento_partido
        GROUP BY departamento, id_partido, partido
      ),
      candidato_mas_votado_por_partido_departamento AS (
        SELECT 
            departamento,
            id_partido,
            partido,
            candidato,
            candidato_apellido,
            lista,
            votos,
            ROW_NUMBER() OVER (PARTITION BY departamento, id_partido ORDER BY votos DESC) as rn
        FROM votos_por_departamento_partido
        WHERE candidato IS NOT NULL
      ),
      partido_ganador_por_departamento AS (
        SELECT 
            departamento,
            id_partido,
            partido,
            total_votos_partido,
            ROW_NUMBER() OVER (PARTITION BY departamento ORDER BY total_votos_partido DESC) as rn
        FROM votos_partido_por_departamento
      ),
      votos_en_blanco_por_departamento AS (
        SELECT 
            D.nombre AS departamento,
            COUNT(*) AS votos_en_blanco
        FROM VOTO V
        INNER JOIN CIRCUITO CIR ON V.id_circuito = CIR.id AND V.id_establecimiento = CIR.id_establecimiento
        INNER JOIN ESTABLECIMIENTO E ON CIR.id_establecimiento = E.id_establecimiento
        INNER JOIN ZONA Z ON E.cod_postal = Z.cod_postal
        INNER JOIN DEPARTAMENTO D ON Z.departamento = D.nombre
        WHERE V.anulado = 0 AND V.en_blanco = 1
        GROUP BY D.nombre
      )
      SELECT 
          pg.departamento,
          pg.partido,
          pg.id_partido,
          pg.total_votos_partido AS votos_validos,
          COALESCE(vb.votos_en_blanco, 0) AS votos_en_blanco,
          pg.total_votos_partido + COALESCE(vb.votos_en_blanco, 0) AS votos_totales,
          cm.candidato,
          cm.candidato_apellido,
          cm.lista
      FROM partido_ganador_por_departamento pg
      LEFT JOIN candidato_mas_votado_por_partido_departamento cm 
          ON pg.departamento = cm.departamento 
          AND pg.id_partido = cm.id_partido 
          AND cm.rn = 1
      LEFT JOIN votos_en_blanco_por_departamento vb 
          ON pg.departamento = vb.departamento
      WHERE pg.rn = 1
      ORDER BY pg.departamento;
      `
    );

    // Procesamos los resultados para formato final
    const resultadosFinales = result.map((row) => ({
      departamento: row.departamento,
      partido: row.partido,
      id_partido: row.id_partido,
      votos_validos: parseInt(row.votos_validos) || 0,
      votos_en_blanco: parseInt(row.votos_en_blanco) || 0,
      votos_totales: parseInt(row.votos_totales) || 0,
      candidato_principal:
        row.candidato && row.candidato_apellido
          ? `${row.candidato} ${row.candidato_apellido}`
          : row.candidato || "Sin candidato principal",
      lista_principal: row.lista || "Sin lista",
      partido_candidato:
        row.candidato && row.candidato_apellido
          ? `${row.partido} — ${row.candidato} ${row.candidato_apellido}`
          : row.partido,
    }));

    res.json(resultadosFinales);
  } catch (err) {
    console.error("Error al obtener resultados por departamento:", err);
    res.status(500).send("Error al obtener resultados por departamento");
  }
};
