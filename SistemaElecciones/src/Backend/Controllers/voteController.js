import db from "../Config/db.js";

export const registrarVoto = async (req, res) => {
  const {
    credencial_habilitado,
    id_eleccion,
    id_circuito,
    id_establecimiento,
    nro_lista,
    es_valido,
    en_blanco,
    observado
  } = req.body;

  try {
    // Verificar si ya votó
    const [rows] = await db.execute(
      `SELECT voto_emitido FROM HABILITADO_A_VOTAR_ELECCION
       WHERE credencial_habilitado = ? AND id_eleccion = ?`,
      [credencial_habilitado, id_eleccion]
    );

    if (rows.length > 0 && rows[0].voto_emitido) {
      return res.status(400).json({ message: "Ya has emitido tu voto para esta elección" });
    }

    const fechaActual = new Date();
    const fecha = fechaActual.toISOString().split('T')[0];
    const hora = fechaActual.toTimeString().split(' ')[0];

    // Registrar voto
    await db.execute(
      `INSERT INTO VOTO (id_eleccion, id_circuito, id_establecimiento, nro_lista, es_valido, en_blanco, observado, fecha, hora)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_eleccion, id_circuito, id_establecimiento, nro_lista, es_valido, en_blanco, observado, fecha, hora]
    );

    // Actualizar habilitado a voto_emitido = true
    await db.execute(
      `UPDATE HABILITADO_A_VOTAR_ELECCION
       SET voto_emitido = TRUE
       WHERE credencial_habilitado = ? AND id_eleccion = ?`,
      [credencial_habilitado, id_eleccion]
    );

    res.status(200).json({ message: "Voto registrado exitosamente" });

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

    if (rows.length > 0) {
      res.status(200).json({ voto_emitido: rows[0].voto_emitido });
    } else {
      // Cambiar de 404 a 200 para evitar el error de Axios
      res.status(200).json({ voto_emitido: false });
    }
  } catch (err) {
    console.error("Error al verificar voto:", err);
    res.status(500).json({ message: "Error interno al verificar voto" });
  }
};
