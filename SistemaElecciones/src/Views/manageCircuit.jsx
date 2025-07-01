import React, { useState } from "react";
import axios from "axios";
import "../Styles/manageCircuit.css";

const ManageCircuit = () => {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [mostrar, setMostrar] = useState(false);

  const handleFetchEstablecimientos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/establecimientos"
      );
      setEstablecimientos(response.data);
      setMostrar(true);
    } catch (error) {
      console.error("Error al traer los establecimientos:", error);
      alert("Hubo un problema al obtener los datos.");
    }
  };

  return (
    <div className="container">
      <h2>Gestión de Circuitos</h2>
      <button className="btn" onClick={handleFetchEstablecimientos}>
        Establecimientos
      </button>

      {mostrar && (
        <>
          {establecimientos.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre del Establecimiento</th>
                </tr>
              </thead>
              <tbody>
                {establecimientos.map((e, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{e.nombre_establecimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No se encontraron establecimientos.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ManageCircuit;
