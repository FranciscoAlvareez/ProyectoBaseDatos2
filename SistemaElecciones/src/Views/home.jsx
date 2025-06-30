import React from "react";
import "../Styles/home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1>Bienvenido al Sistema de Elecciones</h1>
      <p>
        En Uruguay, las elecciones son un derecho y un deber cívico fundamental. 
        Este sistema permite gestionar de forma digital el proceso electoral, 
        garantizando transparencia, rapidez y seguridad en el registro de votos y la administración de circuitos.
      </p>
      <p>
        Desde aquí podrás realizar todas las acciones correspondientes a tu rol: emitir tu voto, gestionar mesas, 
        ver resultados, o administrar la plataforma electoral si eres parte del equipo gubernamental.
      </p>
      <p>
        Por favor, selecciona en el menú de la izquierda la acción que desees realizar.
      </p>
    </div>
  );
};

export default Home;
