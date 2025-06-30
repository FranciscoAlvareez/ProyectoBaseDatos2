import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/vote.css"

const Vote = () => {
  const [nro_lista, setNroLista] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [idEleccion, setIdEleccion] = useState(null);
  const [yaVoto, setYaVoto] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchEleccionActiva = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/eleccion/activa");
        setIdEleccion(res.data.id_eleccion);

        // Verificar si ya votó
        const votoRes = await axios.get("http://localhost:3000/api/vote/verificar", {
          params: {
            credencial_habilitado: user.credencial,
            id_eleccion: res.data.id_eleccion
          }
        });

        if (votoRes.data.voto_emitido) {
          setYaVoto(true);
          setMensaje("Ya has emitido tu voto para esta elección.");
        }

      } catch (err) {
        console.error("Error al obtener datos:", err);
        setMensaje("No hay elección activa en este momento.");
      }
    };

    fetchEleccionActiva();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/api/vote", {
        credencial_habilitado: user.credencial,
        id_eleccion: idEleccion,
        id_circuito: user.id_circuito,
        id_establecimiento: user.id_establecimiento,
        nro_lista: parseInt(nro_lista),
        es_valido: true,
        en_blanco: false,
        observado: false
      });

      setMensaje(res.data.message);
      setYaVoto(true); // Desactivar formulario tras votar
    } catch (err) {
      setMensaje(err.response.data.message || "Error al registrar voto");
    }
  };

  return (
    <div className="vote-container">
      <h2>Emitir voto</h2>
      {idEleccion && !yaVoto ? (
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Número de lista"
            value={nro_lista}
            onChange={(e) => setNroLista(e.target.value)}
            required
          />
          <button type="submit">Votar</button>
        </form>
      ) : (
        <p>{mensaje}</p>
      )}
    </div>
  );
};

export default Vote;
