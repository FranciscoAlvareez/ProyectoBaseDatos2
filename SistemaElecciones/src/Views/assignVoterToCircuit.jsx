import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AssignVoterToCircuit = () => {
  const [credencial, setCredencial] = useState("");
  const [idCircuito, setIdCircuito] = useState("");
  const [ciudadanos, setCiudadanos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.rol !== "admin") {
      navigate("/unauthorized");
    }

    // Cargamos los ciudadanos que aún no están habilitados
    fetch("http://localhost:3000/api/ciudadanos-no-habilitados")
      .then((res) => res.json())
      .then((data) => setCiudadanos(data));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/assignVoter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credencial, id_circuito: idCircuito }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Votante asignado correctamente");
      setCredencial("");
      setIdCircuito("");
    } else {
      alert(result.message || "Error al asignar");
    }
  };

  return (
    <div className="assign-container">
      <h2>Asignar Votante a Circuito</h2>
      <form onSubmit={handleSubmit}>
        <select
          required
          value={credencial}
          onChange={(e) => setCredencial(e.target.value)}
        >
          <option value="">Seleccionar Ciudadano</option>
          {ciudadanos.map((c) => (
            <option key={c.credencial} value={c.credencial}>
              {c.credencial} - {c.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="ID del circuito"
          value={idCircuito}
          onChange={(e) => setIdCircuito(e.target.value)}
          required
        />

        <button type="submit">Asignar</button>
      </form>
    </div>
  );
};

export default AssignVoterToCircuit;
