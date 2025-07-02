import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/authContext";
import "../Styles/login.css";

const Login = () => {
  const [credencial, setCredencial] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya está logueado, redirige automáticamente al home
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Enviando al backend:", { credencial, password });
      const res = await axios.post("http://localhost:3000/api/login", {
        credencial,
        password,
      });

      // Guardar usuario en context y localStorage
      login(res.data);

      // Redirecciona al home
      navigate("/home");
    } catch (err) {
      setError("Credenciales incorrectas o usuario no encontrado");
      console.log(err);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img src="/escudoUruguay.svg" alt="Escudo de Uruguay" className="Logo" />
        <h2>Ingreso al Sistema de Elecciones</h2>

        <input
          type="text"
          placeholder="Credencial"
          value={credencial}
          onChange={(e) => setCredencial(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Ingresar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
