import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/voteObserved.css"

const VoteObserved = () => {
  const [votos, setVotos] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchVotos = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/vote/observed/${user.id_establecimiento}`);
        setVotos(res.data);
      } catch (err) {
        console.error("Error al obtener votos observados:", err);
      }
    };

    fetchVotos();
  }, [user.id_establecimiento]);

  const aprobarVoto = async (id_voto) => {
    try {
      await axios.put(`http://localhost:3000/api/vote/approve/${id_voto}`);
      alert("Voto aprobado correctamente");
      setVotos(votos.filter(voto => voto.id_voto !== id_voto));
    } catch (err) {
      console.error("Error al aprobar voto:", err);
      alert("Error al aprobar voto");
    }
  };

  return (
    <div className="vote-observed-container">
      <h2>Votos Observados Pendientes</h2>
      {votos.length === 0 ? (
        <p>No hay votos observados pendientes</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID Voto</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Circuito</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {votos.map(voto => (
              <tr key={voto.id_voto}>
                <td>{voto.id_voto}</td>
                <td>{voto.fecha}</td>
                <td>{voto.hora}</td>
                <td>{voto.id_circuito}</td>
                <td><button onClick={() => aprobarVoto(voto.id_voto)}>Aprobar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VoteObserved;
