import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RegisterVoter = () => {
  const [formData, setFormData] = useState({
    credencial: "",
    ci: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nac: "",
    contraseña: ""
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
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/registerVoter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Ciudadano registrado correctamente");
        setFormData({
          credencial: "",
          ci: "",
          nombre: "",
          apellido_paterno: "",
          apellido_materno: "",
          fecha_nac: "",
          contraseña: ""
        });
      } else {
        alert(result.message || "Error al registrar");
      }
    } catch (err) {
      console.error("Error en el registro:", err);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registrar Habilitado a Votar</h2>
        <input name="credencial" placeholder="Credencial" value={formData.credencial} onChange={handleChange} required />
        <input name="ci" placeholder="Cédula de Identidad" value={formData.ci} onChange={handleChange} required />
        <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
        <input name="apellido_paterno" placeholder="Apellido Paterno" value={formData.apellido_paterno} onChange={handleChange} required />
        <input name="apellido_materno" placeholder="Apellido Materno" value={formData.apellido_materno} onChange={handleChange} required />
        <input type="date" name="fecha_nac" placeholder="Fecha de nacimiento" value={formData.fecha_nac} onChange={handleChange} required />
        <input type="password" name="contraseña" placeholder="Contraseña" value={formData.contraseña} onChange={handleChange} required />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default RegisterVoter;
