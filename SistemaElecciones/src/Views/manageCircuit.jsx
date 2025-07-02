import React, { useState } from "react";
import "../Styles/manageCircuit.css";

const ManageCircuit = () => {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [circuitos, setCircuitos] = useState({});
  const [resultados, setResultados] = useState({});
  const [resultadosGlobales, setResultadosGlobales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [circuitosVisibles, setCircuitosVisibles] = useState({});
  const [resultadosVisibles, setResultadosVisibles] = useState({});
  const [resultadosGlobalesVisibles, setResultadosGlobalesVisibles] =
    useState(false);
  const [establecimientosVisibles, setEstablecimientosVisibles] =
    useState(false);
  const [tipoVista, setTipoVista] = useState({});

  // Función para crear clave compuesta del circuito
  const crearClaveCircuito = (idCircuito, idEstablecimiento) => {
    return `${idCircuito}_${idEstablecimiento}`;
  };

  const toggleResultados = async (idCircuito, idEstablecimiento) => {
    const claveCircuito = crearClaveCircuito(idCircuito, idEstablecimiento);
    console.log(claveCircuito);

    // Si ya están visibles, los ocultamos
    if (resultadosVisibles[claveCircuito]) {
      setResultadosVisibles((prev) => ({ ...prev, [claveCircuito]: false }));
      return;
    }

    // Si ya se cargaron antes, solo los mostramos
    if (resultados[claveCircuito]) {
      setResultadosVisibles((prev) => ({ ...prev, [claveCircuito]: true }));
      return;
    }

    // Sino, los cargamos y mostramos
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/api/circuitos/resultados/${idCircuito}/${idEstablecimiento}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResultados((prev) => ({ ...prev, [claveCircuito]: data }));
      setResultadosVisibles((prev) => ({ ...prev, [claveCircuito]: true }));
    } catch (err) {
      setError(`Error al obtener resultados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleEstablecimientos = async () => {
    if (establecimientosVisibles) {
      setEstablecimientosVisibles(false);
      return;
    }

    if (establecimientos.length > 0) {
      setEstablecimientosVisibles(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/api/establecimientos");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setEstablecimientos(data);
      setEstablecimientosVisibles(true);
    } catch (err) {
      setError(`Error al obtener establecimientos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleCircuitos = async (idEst) => {
    if (circuitosVisibles[idEst]) {
      setCircuitosVisibles((prev) => ({ ...prev, [idEst]: false }));
      return;
    }

    if (circuitos[idEst]) {
      setCircuitosVisibles((prev) => ({ ...prev, [idEst]: true }));
      return;
    }

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

  const toggleResultadosGlobales = async () => {
    if (resultadosGlobalesVisibles) {
      setResultadosGlobalesVisibles(false);
      return;
    }

    if (resultadosGlobales.length > 0) {
      setResultadosGlobalesVisibles(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/api/circuitos/globales");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResultadosGlobales(data);
      setResultadosGlobalesVisibles(true);
    } catch (err) {
      setError(`Error al obtener resultados globales: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar el tipo de vista usando la clave compuesta
  const cambiarTipoVista = (idCircuito, idEstablecimiento) => {
    const claveCircuito = crearClaveCircuito(idCircuito, idEstablecimiento);

    setTipoVista((prev) => {
      const actual = prev[claveCircuito] || "lista";
      let siguiente;

      if (actual === "lista") {
        siguiente = "partido";
      } else if (actual === "partido") {
        siguiente = "candidato";
      } else {
        siguiente = "lista";
      }

      return { ...prev, [claveCircuito]: siguiente };
    });
  };

  // Función para procesar resultados según la vista seleccionada
  const procesarResultados = (resultadosCircuito, tipoVista = "lista") => {
    return resultadosCircuito.reduce((acc, r) => {
      let lista, partido, candidato, clave;

      // Clasificamos el voto
      if (r.anulado === 1) {
        lista = "Anulado";
        partido = "Anulado";
        candidato = "Anulado";
        clave = "Anulado";
      } else if (r.en_blanco === 1) {
        lista = "En Blanco";
        partido = "En Blanco";
        candidato = "En Blanco";
        clave = "En Blanco";
      } else if (r.anulado !== 1 && r.en_blanco !== 1) {
        lista = r.lista || "Sin Lista";
        partido = r.partido || "Sin Partido";

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

      <div className="button-container">
        <button
          onClick={toggleEstablecimientos}
          className={`load-button ${establecimientosVisibles ? "active" : ""}`}
        >
          {establecimientosVisibles
            ? "Ocultar Establecimientos"
            : "Establecimientos"}
        </button>

        <button
          onClick={toggleResultadosGlobales}
          className={`load-button global-results-button ${
            resultadosGlobalesVisibles ? "active" : ""
          }`}
        >
          {resultadosGlobalesVisibles
            ? "Ocultar Resultados Globales"
            : "🌍 Ver Resultados Globales"}
        </button>
      </div>

      {/* Sección de Resultados Globales */}
      {resultadosGlobalesVisibles && (
        <div className="resultados-globales-section">
          <h3 className="resultados-globales-title">
            🏆 Resultados Globales por Partido
          </h3>

          {resultadosGlobales.length > 0 ? (
            <div>
              <table className="tabla-resultados tabla-globales">
                <thead>
                  <tr className="header-globales">
                    <th className="col-posicion">Posición</th>
                    <th className="col-partido">Partido</th>
                    <th className="col-votos-validos">Votos Válidos</th>
                    <th className="col-votos-blanco">Votos en Blanco</th>
                    <th className="col-total">Total de Votos</th>
                    <th className="col-porcentaje">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const totalVotosGlobal = resultadosGlobales.reduce(
                      (sum, partido) => sum + partido.votos_totales,
                      0
                    );

                    return resultadosGlobales.map((partido, index) => {
                      const porcentaje = totalVotosGlobal
                        ? (
                            (partido.votos_totales / totalVotosGlobal) *
                            100
                          ).toFixed(1) + "%"
                        : "0%";

                      return (
                        <tr
                          key={partido.id_partido}
                          className={`fila-partido ${
                            partido.es_ganador ? "ganador" : ""
                          } ${index % 2 === 0 ? "par" : "impar"}`}
                        >
                          <td className="col-posicion">
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `${index + 1}°`}
                          </td>
                          <td className="col-partido">
                            {partido.partido}
                            {partido.es_ganador && " 👑"}
                          </td>
                          <td className="col-votos-validos">
                            {partido.votos_validos.toLocaleString()}
                          </td>
                          <td className="col-votos-blanco">
                            {partido.votos_en_blanco > 0
                              ? `+${partido.votos_en_blanco.toLocaleString()}`
                              : "0"}
                          </td>
                          <td className="col-total">
                            {partido.votos_totales.toLocaleString()}
                          </td>
                          <td className="col-porcentaje">{porcentaje}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>

              <div className="nota-explicativa">
                ℹ️ <strong>Nota:</strong> Los votos en blanco se suman
                únicamente al partido ganador (mayor cantidad de votos válidos).
              </div>
            </div>
          ) : (
            <p className="no-resultados">
              No hay resultados globales disponibles.
            </p>
          )}
        </div>
      )}

      {/* Sección de Establecimientos */}
      {establecimientosVisibles && establecimientos.length > 0 && (
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
                    {circuitos[est.id_establecimiento].map((c) => {
                      const claveCircuito = crearClaveCircuito(
                        c.id,
                        c.id_establecimiento
                      );

                      return (
                        <div key={claveCircuito} className="circuito-card">
                          <p>
                            <strong>Circuito #{c.id}</strong> - EST#
                            {c.id_establecimiento}
                            <br />
                            Serie: {c.principio_serie} - {c.final_serie}
                            <br />
                            Accesible: {c.accesible ? "Sí" : "No"}
                          </p>

                          <button
                            onClick={() =>
                              toggleResultados(c.id, c.id_establecimiento)
                            }
                            className="ver-resultados-button"
                          >
                            {resultadosVisibles[claveCircuito]
                              ? "Ocultar Resultados"
                              : "Ver Resultados"}
                          </button>

                          {resultadosVisibles[claveCircuito] &&
                            resultados[claveCircuito] && (
                              <div className="resultados-list">
                                <div className="vista-controls">
                                  <h5>Resultados:</h5>
                                  <button
                                    onClick={() =>
                                      cambiarTipoVista(
                                        c.id,
                                        c.id_establecimiento
                                      )
                                    }
                                    className={`toggle-view-button ${
                                      tipoVista[claveCircuito] || "lista"
                                    }`}
                                  >
                                    {(tipoVista[claveCircuito] || "lista") ===
                                      "lista" && "📊 Ver por Partido"}
                                    {(tipoVista[claveCircuito] || "lista") ===
                                      "partido" && "👤 Ver por Candidato"}
                                    {(tipoVista[claveCircuito] || "lista") ===
                                      "candidato" && "📝 Ver por Lista"}
                                  </button>
                                </div>

                                <table className="tabla-resultados">
                                  <thead>
                                    <tr>
                                      {(tipoVista[claveCircuito] || "lista") ===
                                        "lista" && <th>Lista</th>}
                                      <th>Partido</th>
                                      {(tipoVista[claveCircuito] || "lista") ===
                                        "candidato" && <th>Candidato</th>}
                                      <th>Cant. Votos</th>
                                      <th>Porcentaje</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const vistaActual =
                                        tipoVista[claveCircuito] || "lista";
                                      const resultadosAgrupados =
                                        procesarResultados(
                                          resultados[claveCircuito],
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
                                          ? (
                                              (r.votos / totalVotos) *
                                              100
                                            ).toFixed(1) + "%"
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
                      );
                    })}
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
