import db from "../Config/db.js";

export const registrarVoto = async (req, res) => {
  const {
    credencial_habilitado,
    id_eleccion,
    id_circuito,
    id_establecimiento,
    nro_lista,
    en_blanco,
    anulado
  } = req.body;

  try {
    // Validar habilitación
    const [rows] = await db.execute(
      `SELECT voto_emitido, id_circuito, id_establecimiento
       FROM HABILITADO_A_VOTAR_ELECCION
       WHERE credencial_habilitado = ? AND id_eleccion = ?`,
      [credencial_habilitado, id_eleccion]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "No estás habilitado para esta elección" });
    }

    if (rows[0].voto_emitido) {
      return res.status(400).json({ message: "Ya has emitido tu voto para esta elección" });
    }

    const circuitoAsignado = rows[0].id_circuito;
    const establecimientoAsignado = rows[0].id_establecimiento;

    const observado = (Number(circuitoAsignado) !== Number(id_circuito) || Number(establecimientoAsignado) !== Number(id_establecimiento));

    const fechaActual = new Date();
    const fecha = fechaActual.toISOString().split('T')[0];
    const hora = fechaActual.toTimeString().split(' ')[0];

    let listaFinal = nro_lista;
    let esAnulado = false;

    if (en_blanco) {
      // Obtener lista con más votos
      const [mayoria] = await db.execute(
        `SELECT nro_lista, COUNT(*) as cantidad
         FROM VOTO
         WHERE id_eleccion = ? AND nro_lista IS NOT NULL
         GROUP BY nro_lista
         ORDER BY cantidad DESC
         LIMIT 2`,
        [id_eleccion]
      );

      if (mayoria.length === 0) {
        // Primer voto, considerar anulado
        listaFinal = null;
        esAnulado = true;
      } else if (mayoria.length > 1 && mayoria[0].cantidad === mayoria[1].cantidad) {
        // Empate, anulado
        listaFinal = null;
        esAnulado = true;
      } else {
        // Asignar a lista con más votos
        listaFinal = mayoria[0].nro_lista;
      }
    }

    if (anulado) {
      listaFinal = null;
      esAnulado = true;
    }

    // Insertar voto
    await db.execute(
      `INSERT INTO VOTO (id_eleccion, id_circuito, id_establecimiento, nro_lista, es_valido, en_blanco, anulado, observado, fecha, hora)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_eleccion,
        id_circuito,
        id_establecimiento,
        listaFinal,
        !observado,
        en_blanco,
        esAnulado,
        observado,
        fecha,
        hora
      ]
    );

    // Marcar como voto emitido
    await db.execute(
      `UPDATE HABILITADO_A_VOTAR_ELECCION
       SET voto_emitido = TRUE
       WHERE credencial_habilitado = ? AND id_eleccion = ?`,
      [credencial_habilitado, id_eleccion]
    );

    let message = "Voto registrado exitosamente.";
    if (observado) message = "Voto registrado como observado, pendiente de validación.";
    if (esAnulado) message = "Voto registrado como anulado o en blanco.";

    return res.status(200).json({ message });

  } catch (err) {
    console.error("Error al registrar voto:", err);
    res.status(500).json({ message: "Error interno al registrar voto" });
  }
};

export const getListas = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT L.numero, L.nombre, P.nombre AS partido
       FROM LISTA L
       JOIN PARTIDO P ON L.id_partido = P.id`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener listas:", err);
    res.status(500).json({ message: "Error interno al obtener listas" });
  }
};

export const verificarVoto = async (req, res) => {
  const { credencial_habilitado, id_eleccion } = req.query;

  try {
    const [rows] = await db.execute(
      `SELECT voto_emitido FROM HABILITADO_A_VOTAR_ELECCION
       WHERE credencial_habilitado = ? AND id_eleccion = ?`,
      [credencial_habilitado, id_eleccion]
    );

    res.status(200).json({ voto_emitido: rows.length > 0 ? rows[0].voto_emitido : false });
  } catch (err) {
    console.error("Error al verificar voto:", err);
    res.status(500).json({ message: "Error interno al verificar voto" });
  }
};

export const registrarVotoObservado = async (req, res) => {
  const {
    credencial_habilitado,
    id_eleccion,
    id_circuito,
    id_establecimiento,
    nro_lista,
    es_valido,
    en_blanco,
    anulado
  } = req.body;

  try {
    const fechaActual = new Date();
    const fecha = fechaActual.toISOString().split('T')[0];
    const hora = fechaActual.toTimeString().split(' ')[0];

    await db.execute(
      `INSERT INTO VOTO (id_eleccion, id_circuito, id_establecimiento, nro_lista, es_valido, en_blanco, anulado, observado, fecha, hora)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
      [id_eleccion, id_circuito, id_establecimiento, nro_lista, es_valido, en_blanco, anulado, fecha, hora]
    );

    await db.execute(
      `UPDATE HABILITADO_A_VOTAR_ELECCION
       SET voto_emitido = TRUE
       WHERE credencial_habilitado = ? AND id_eleccion = ?`,
      [credencial_habilitado, id_eleccion]
    );

    res.status(200).json({ message: "Voto observado registrado exitosamente" });

  } catch (err) {
    console.error("Error al registrar voto observado:", err);
    res.status(500).json({ message: "Error interno al registrar voto observado" });
  }
};

export const listarVotosObservados = async (req, res) => {
  const { id_establecimiento } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT V.id_voto, V.fecha, V.hora, V.id_circuito
       FROM VOTO V
       WHERE V.id_establecimiento = ? AND V.observado = TRUE AND V.es_valido = FALSE`,
      [id_establecimiento]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error al listar votos observados:", err);
    res.status(500).json({ message: "Error interno al listar votos observados" });
  }
};

export const aprobarVotoObservado = async (req, res) => {
  const { id_voto } = req.params;

  try {
    await db.execute(
      `UPDATE VOTO
       SET es_valido = TRUE
       WHERE id_voto = ?`,
      [id_voto]
    );

    res.status(200).json({ message: "Voto observado aprobado correctamente" });
  } catch (err) {
    console.error("Error al aprobar voto observado:", err);
    res.status(500).json({ message: "Error interno al aprobar voto observado" });
  }
};

export const getCircuitosPorEstablecimiento = async (req, res) => {
  const { id_establecimiento } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT id FROM CIRCUITO WHERE id_establecimiento = ?`,
      [id_establecimiento]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error al obtener circuitos:", err);
    res.status(500).json({ message: "Error interno al obtener circuitos" });
  }
};
