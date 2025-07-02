import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/createElecction.css"

const CreateElection = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    tipo: "nacional"
  });

  const navigate = useNavigate();

  // Protección por rol admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.rol !== "admin") {
      navigate("/unauthorized");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/election", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (res.ok) {
        alert("Elección creada correctamente");
        setFormData({
          nombre: "",
          fecha: "",
          tipo: "nacional"
        });
      } else {
        alert(result.message || "Error al crear elección");
      }
    } catch (err) {
      console.error("Error al crear elección:", err);
    }
  };

  return (
    <div className="create-election-container">
      <form className="create-election-form" onSubmit={handleSubmit}>
        <h2>Crear Nueva Elección</h2>
        <input
          name="nombre"
          placeholder="Nombre de la elección"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="fecha"
          placeholder="Fecha"
          value={formData.fecha}
          onChange={handleChange}
          required
        />
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
        >
          <option value="nacional">Nacional</option>
          <option value="departamental">Departamental</option>
          <option value="interna">Interna</option>
        </select>
        <button type="submit">Crear Elección</button>
      </form>
    </div>
  );
};

export default CreateElection;
