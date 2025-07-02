import React, { useState, useEffect } from "react";
import "../Styles/createLista.css"

const CreateLista = () => {
  const [formData, setFormData] = useState({
    numero: "",
    credencial_candidato: "",
    id_partido: "",
    nombre: ""
  });

  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    // Obtener partidos para desplegable
    const fetchPartidos = async () => {
      const res = await fetch("http://localhost:3000/api/lista/partidos");
      const data = await res.json();
      setPartidos(data);
    };
    fetchPartidos();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/lista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        setFormData({
          numero: "",
          credencial_candidato: "",
          id_partido: "",
          nombre: ""
        });
      } else {
        alert(result.message || "Error al crear lista");
      }
    } catch (err) {
      console.error("Error en creación de lista:", err);
    }
  };

  return (
    <div className="create-lista-container">
      <form onSubmit={handleSubmit}>
        <h2>Crear Nueva Lista</h2>
        <input name="numero" placeholder="Número de Lista" value={formData.numero} onChange={handleChange} required />
        <input name="credencial_candidato" placeholder="Credencial del Candidato" value={formData.credencial_candidato} onChange={handleChange} required />
        <select name="id_partido" value={formData.id_partido} onChange={handleChange} required>
          <option value="">Seleccione Partido</option>
          {partidos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <input name="nombre" placeholder="Nombre de la Lista" value={formData.nombre} onChange={handleChange} required />
        <button type="submit">Crear Lista</button>
      </form>
    </div>
  );
};

export default CreateLista;
