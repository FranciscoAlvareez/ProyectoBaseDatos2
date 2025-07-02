import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/authContext";
import "../Styles/navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  // Si no hay usuario logueado, no muestra el navbar
  if (!user) return null;

  const { rol } = user;

  return (
    <nav className="navbar">
      <div className="navbar-title">Sistema Elecciones</div>
      <ul className="navbar-links">
        {/* Links generales */}
        <li><Link to="/">Inicio</Link></li>

        {/* Links para ciudadano y gestor */}
        {(rol === "ciudadano" || rol === "gestor") && (
          <>
            <li><Link to="/votar">Votar</Link></li>
          </>
        )}

        {/* Links adicionales para gestor */}
        {rol === "gestor" && (
          <>
            <li><Link to="/votoObservado">Registrar Voto Observado</Link></li>
          </>
        )}

        {/* Links exclusivos admin */}
        {rol === "admin" && (
          <>
            <li><Link to="/admin/createElection">Crear Elección</Link></li>
            <li><Link to="/admin/createPartido">Crear Partido</Link></li>
            <li><Link to="/admin/createLista">Crear Lista</Link></li>
            <li><Link to="/admin/circuitos">Gestionar Circuitos</Link></li>
            <li><Link to="/admin/registerVoter">Registrar Ciudadano</Link></li>
          </>
        )}


        <li>
          <button onClick={logout} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
            Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
