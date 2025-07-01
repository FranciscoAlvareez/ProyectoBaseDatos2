import React, { useState } from "react";
import "../Styles/manageCircuit.css";

const ManageCircuit = () => {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [circuitos, setCircuitos] = useState({});
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [circuitosVisibles, setCircuitosVisibles] = useState({});
  const [resultadosVisibles, setResultadosVisibles] = useState({});
  // Nuevo estado para controlar el tipo de vista: 'lista', 'partido', 'candidato'
  const [tipoVista, setTipoVista] = useState({});

  const toggleResultados = async (idCircuito) => {
    // Si ya están visibles, los ocultamos
    if (resultadosVisibles[idCircuito]) {
      setResultadosVisibles((prev) => ({ ...prev, [idCircuito]: false }));
      return;
    }

    // Si ya se cargaron antes, solo los mostramos
    if (resultados[idCircuito]) {
      setResultadosVisibles((prev) => ({ ...prev, [idCircuito]: true }));
      return;
    }

    // Sino, los cargamos y mostramos
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/api/circuitos/resultados/${idCircuito}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResultados((prev) => ({ ...prev, [idCircuito]: data }));
      setResultadosVisibles((prev) => ({ ...prev, [idCircuito]: true }));
    } catch (err) {
      setError(`Error al obtener resultados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const toggleCircuitos = async (idEst) => {
    // Si ya están visibles, los ocultamos
    if (circuitosVisibles[idEst]) {
      setCircuitosVisibles((prev) => ({ ...prev, [idEst]: false }));
      return;
    }

    // Si ya se cargaron antes, solo cambiamos visibilidad
    if (circuitos[idEst]) {
      setCircuitosVisibles((prev) => ({ ...prev, [idEst]: true }));
      return;
    }

    // Sino, los cargamos y mostramos
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/api/circuitos/establecimiento/${idEst}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCircuitos((prev) => ({ ...prev, [idEst]: data }));
      setCircuitosVisibles((prev) => ({ ...prev, [idEst]: true }));
    } catch (err) {
      setError(`Error al obtener circuitos: ${err.message}`);
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

  // Función para cambiar el tipo de vista
  const cambiarTipoVista = (idCircuito) => {
    setTipoVista((prev) => {
      const actual = prev[idCircuito] || "lista";
      let siguiente;

      if (actual === "lista") {
        siguiente = "partido";
      } else if (actual === "partido") {
        siguiente = "candidato";
      } else {
        siguiente = "lista";
      }

      return { ...prev, [idCircuito]: siguiente };
    });
  };

  // Función para procesar resultados según la vista seleccionada
  const procesarResultados = (resultadosCircuito, tipoVista = "lista") => {
    return resultadosCircuito.reduce((acc, r) => {
      let lista, partido, candidato, clave;
      // Clasificamos el voto
      if (r.es_valido === 0) {
        lista = "Anulado";
        partido = "Anulado";
        candidato = "Anulado";
        clave = "Anulado";
      } else if (r.en_blanco === 1) {
        lista = "En Blanco";
        partido = "En Blanco";
        candidato = "En Blanco";
        clave = "En Blanco";
      } else if (r.es_valido !== 0 && r.en_blanco !== 1) {
        lista = r.lista || "Sin Lista";
        partido = r.partido || "Sin Partido";

        // Concatenamos nombre y apellido del candidato
        const nombreCompleto =
          r.candidato && r.candidato_apellido
            ? `${r.candidato} ${r.candidato_apellido}`
            : r.candidato || "Sin Candidato";
        candidato = nombreCompleto;

        if (tipoVista === "partido") {
          clave = r.id_partido ? `partido_${r.id_partido}` : partido;
        } else if (tipoVista === "candidato") {
          clave = r.credencial_candidato
            ? `candidato_${r.credencial_candidato}`
            : candidato;
        } else {
          clave = `${lista}-${partido}`;
        }
      } else {
        lista = "Otros";
        partido = "Otros";
        candidato = "Otros";
        clave = "Otros";
      }

      if (acc[clave]) {
        acc[clave].votos += r.votos;
      } else {
        acc[clave] = {
          lista: tipoVista === "lista" ? lista : "",
          partido: partido,
          candidato: tipoVista === "candidato" ? candidato : "",
          votos: r.votos,
          id_partido: r.id_partido || null,
          credencial_candidato: r.credencial_candidato || null,
        };
      }

      return acc;
    }, {});
  };

  return (
    <div className="manage-circuit-container">
      <h2>Gestión de Circuitos</h2>

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
                  EST#{est.id_establecimiento}
                </small>
              </div>

              <button
                onClick={() => toggleCircuitos(est.id_establecimiento)}
                className="view-circuitos-button"
              >
                {circuitosVisibles[est.id_establecimiento]
                  ? "Ocultar Circuitos"
                  : "Ver Circuitos"}
              </button>

              {circuitosVisibles[est.id_establecimiento] &&
                circuitos[est.id_establecimiento] && (
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
                          onClick={() => toggleResultados(c.id)}
                          className="ver-resultados-button"
                        >
                          {resultadosVisibles[c.id]
                            ? "Ocultar Resultados"
                            : "Ver Resultados"}
                        </button>

                        {resultadosVisibles[c.id] && resultados[c.id] && (
                          <div className="resultados-list">
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                marginBottom: "15px",
                                alignItems: "center",
                                borderBottom: "1px solid #ddd",
                                paddingBottom: "10px",
                              }}
                            >
                              <h5 style={{ margin: 0 }}>Resultados:</h5>
                              <button
                                onClick={() => cambiarTipoVista(c.id)}
                                className="toggle-view-button"
                                style={{
                                  padding: "8px 15px",
                                  backgroundColor:
                                    (tipoVista[c.id] || "lista") === "lista"
                                      ? "#007bff"
                                      : (tipoVista[c.id] || "lista") ===
                                        "partido"
                                      ? "#28a745"
                                      : "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                }}
                              >
                                {(tipoVista[c.id] || "lista") === "lista" &&
                                  "📊 Ver por Partido"}
                                {(tipoVista[c.id] || "lista") === "partido" &&
                                  "👤 Ver por Candidato"}
                                {(tipoVista[c.id] || "lista") === "candidato" &&
                                  "📝 Ver por Lista"}
                              </button>
                            </div>

                            <table className="tabla-resultados">
                              <thead>
                                <tr>
                                  {(tipoVista[c.id] || "lista") === "lista" && (
                                    <th>Lista</th>
                                  )}
                                  <th>Partido</th>
                                  {(tipoVista[c.id] || "lista") ===
                                    "candidato" && <th>Candidato</th>}
                                  <th>Cant. Votos</th>
                                  <th>Porcentaje</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const vistaActual =
                                    tipoVista[c.id] || "lista";
                                  const resultadosAgrupados =
                                    procesarResultados(
                                      resultados[c.id],
                                      vistaActual
                                    );

                                  const resultadosArray =
                                    Object.values(resultadosAgrupados);
                                  const totalVotos = resultadosArray.reduce(
                                    (sum, r) => sum + r.votos,
                                    0
                                  );

                                  return resultadosArray.map((r, index) => {
                                    const porcentaje = totalVotos
                                      ? ((r.votos / totalVotos) * 100).toFixed(
                                          1
                                        ) + "%"
                                      : "0%";

                                    return (
                                      <tr key={index}>
                                        {vistaActual === "lista" && (
                                          <td>{r.lista}</td>
                                        )}
                                        <td>{r.partido}</td>
                                        {vistaActual === "candidato" && (
                                          <td>{r.candidato}</td>
                                        )}
                                        <td>{r.votos}</td>
                                        <td>{porcentaje}</td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
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
