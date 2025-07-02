import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/createPartido.css";

const CreatePartido = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    calle: "",
    ciudad: "",
    nro_puerta: "",
    presidente: "",
    vicepresidente: ""
  });

  const navigate = useNavigate();

  // Protección admin
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
        const res = await fetch("http://localhost:3000/api/partido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        });

        const result = await res.json();

        if (res.ok) {
        alert(result.message);
        setFormData({
            nombre: "",
            calle: "",
            ciudad: "",
            nro_puerta: "",
            presidente: "",
            vicepresidente: ""
        });
        } else {
        alert(result.message || "Error al crear partido y autoridades");
        }

    } catch (err) {
        console.error("Error en creación de partido:", err);
    }
    };


  return (
    <div className="create-partido-container">
      <form className="create-partido-form" onSubmit={handleSubmit}>
        <h2>Crear Nuevo Partido</h2>
        <input
          name="nombre"
          placeholder="Nombre del partido"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          name="calle"
          placeholder="Calle"
          value={formData.calle}
          onChange={handleChange}
          required
        />
        <input
          name="ciudad"
          placeholder="Ciudad"
          value={formData.ciudad}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="nro_puerta"
          placeholder="Número de puerta"
          value={formData.nro_puerta}
          onChange={handleChange}
          required
        />
        <input
          name="presidente"
          placeholder="Presidente"
          value={formData.presidente}
          onChange={handleChange}
          required
        />
        <input
          name="vicepresidente"
          placeholder="Vicepresidente"
          value={formData.vicepresidente}
          onChange={handleChange}
          required
        />
        <button type="submit">Crear Partido</button>
      </form>
    </div>
  );
};

export default CreatePartido;
