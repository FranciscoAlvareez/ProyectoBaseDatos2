import React, { useState } from "react";
import "../Styles/manageCircuit.css";

const ManageCircuit = () => {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [circuitos, setCircuitos] = useState({});
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEstablecimientos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/api/establecimientos");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setEstablecimientos(data);
    } catch (err) {
      setError(`Error al obtener establecimientos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCircuitos = async (idEst) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/api/circuitos/establecimiento/${idEst}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCircuitos((prev) => ({ ...prev, [idEst]: data }));
    } catch (err) {
      setError(`Error al obtener circuitos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchResultados = async (idCircuito) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/api/circuitos/resultados/${idCircuito}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResultados((prev) => ({ ...prev, [idCircuito]: data }));
    } catch (err) {
      setError(`Error al obtener resultados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-circuit-container">
      <h2>Gestión de Circuitos - Debug Version</h2>

      {loading && <div className="loading-message">Cargando...</div>}
      {error && <div className="error-message">{error}</div>}

      <button onClick={fetchEstablecimientos} className="load-button">
        Establecimientos
      </button>

      {establecimientos.length > 0 && (
        <div>
          <h3>Establecimientos encontrados: {establecimientos.length}</h3>
          {establecimientos.map((est) => (
            <div key={est.id_establecimiento} className="establecimiento-card">
              <div className="establecimiento-info">
                <strong>{est.nombre_establecimiento}</strong>
                <br />
                <small>
                  {est.calle} {est.nro_puerta} - CP: {est.cod_postal}
                  <br />
                  Circuito #{est.id_establecimiento}
                </small>
              </div>

              <button
                onClick={() => fetchCircuitos(est.id_establecimiento)}
                className="view-circuitos-button"
              >
                Ver Circuitos
              </button>

              {circuitos[est.id_establecimiento] && (
                <div className="circuito-list">
                  <h4>
                    Circuitos ({circuitos[est.id_establecimiento].length})
                  </h4>
                  {circuitos[est.id_establecimiento].map((c) => (
                    <div key={c.id} className="circuito-card">
                      <p>
                        <strong>Circuito #{c.id}</strong>
                        <br />
                        Serie: {c.principio_serie} - {c.final_serie}
                        <br />
                        Accesible: {c.accesible ? "Sí" : "No"}
                      </p>

                      <button
                        onClick={() => fetchResultados(c.id)}
                        className="ver-resultados-button"
                      >
                        Ver Resultados
                      </button>

                      {resultados[c.id] && (
                        <div className="resultados-list">
                          <h5>Resultados:</h5>
                          <ul>
                            {resultados[c.id].map((r, index) => (
                              <li key={index}>
                                {r.partido || "Voto en blanco"} - Lista:{" "}
                                {r.lista || "N/A"} - Votos: {r.votos}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCircuit;
