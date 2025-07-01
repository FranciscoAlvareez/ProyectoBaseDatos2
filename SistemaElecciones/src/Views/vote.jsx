import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/vote.css";

const Vote = () => {
  const [nro_lista, setNroLista] = useState("");
  const [circuitoSeleccionado, setCircuitoSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [idEleccion, setIdEleccion] = useState(null);
  const [yaVoto, setYaVoto] = useState(false);
  const [listas, setListas] = useState([]);
  const [circuitos, setCircuitos] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    console.log("usuario cargado:", user);
    const fetchData = async () => {
      if (!user.id_establecimiento) {
        setMensaje("No estás habilitado para votar o falta información de tu establecimiento.");
        return;
      }

      try {
        // Obtener elección activa
        const eleccionRes = await axios.get("http://localhost:3000/api/eleccion/activa");
        setIdEleccion(eleccionRes.data.id_eleccion);

        // Obtener listas disponibles
        const listasRes = await axios.get("http://localhost:3000/api/vote/listas");
        setListas(listasRes.data);

        // Obtener circuitos disponibles en el establecimiento del usuario
        const circuitosRes = await axios.get(`http://localhost:3000/api/vote/circuitos/${user.id_establecimiento}`);
        setCircuitos(circuitosRes.data);

        // Verificar si ya votó
        const votoRes = await axios.get("http://localhost:3000/api/vote/verificar", {
          params: {
            credencial_habilitado: user.credencial,
            id_eleccion: eleccionRes.data.id_eleccion,
          },
        });

        if (votoRes.data.voto_emitido) {
          setYaVoto(true);
          setMensaje("Ya has emitido tu voto para esta elección.");
        }

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setMensaje("No hay elección activa o error en el sistema.");
      }
    };

    fetchData();
  }, [user.id_establecimiento, user.credencial]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let body = {
      credencial_habilitado: user.credencial,
      id_eleccion: idEleccion,
      id_circuito: circuitoSeleccionado,
      id_establecimiento: user.id_establecimiento,
      nro_lista: null,
      es_valido: true,
      en_blanco: false,
      anulado: false,
      observado: false
    };

    if (nro_lista === "BLANCO") {
      body.en_blanco = true;
    } else if (nro_lista === "ANULADO") {
      body.anulado = true;
    } else {
      body.nro_lista = parseInt(nro_lista);
    }

    try {
      const res = await axios.post("http://localhost:3000/api/vote", body);
      setMensaje(res.data.message);
    } catch (err) {
      console.error("Error al registrar voto:", err);
      setMensaje(err.response?.data?.message || "Error al registrar voto");
    }
  };

  return (
    <div className="vote-container">
      <h2>Emitir Voto</h2>

      {mensaje && <p className="vote-message">{mensaje}</p>}

      {idEleccion && !yaVoto && (
        <form className="vote-form" onSubmit={handleSubmit}>
          <label htmlFor="nro_lista">Seleccione su lista:</label>
          <select
            id="nro_lista"
            value={nro_lista}
            onChange={(e) => setNroLista(e.target.value)}
            required
          >
            <option value="">--Seleccione una lista--</option>
            {listas.map((lista) => (
              <option key={lista.numero} value={lista.numero}>
                {lista.numero} - {lista.nombre} ({lista.partido})
              </option>
            ))}
            <option value="BLANCO">Voto en blanco</option>
            <option value="ANULADO">Voto anulado</option>
          </select>

          <label htmlFor="circuito">Seleccione su circuito:</label>
          <select
            id="circuito"
            value={circuitoSeleccionado}
            onChange={(e) => setCircuitoSeleccionado(e.target.value)}
            required
          >
            <option value="">--Seleccione un circuito--</option>
            {circuitos.map((circuito) => (
              <option key={circuito.id} value={circuito.id}>
                {circuito.id}
              </option>
            ))}
          </select>

          <button type="submit">Confirmar Voto</button>
        </form>
      )}
    </div>
  );
};

export default Vote;
