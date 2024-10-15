import React from "react";

export default function PaginaTemporal() {
  return (
    <section
      className="vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{ backgroundColor: "#d4f1d8", textAlign: "center", padding: "20px" }}  // Fondo verde muy clarito
    >
      <div className="container d-flex flex-column justify-content-center align-items-center h-100">
        {/* Mensaje en la parte superior centrado con efecto de movimiento */}
        <div className="w-100" style={{ marginBottom: "40px" }}>
          <h1
            className="moving-text gradient-text"
            style={{
              fontFamily: "'Bungee', sans-serif",
              fontSize: "2.5rem",
              color: "#333",
              marginBottom: "20px"
            }}
          >
            Estamos trabajando para vos
          </h1>
          <p
            className="description-text shadow-text"
            style={{ fontSize: "1.5rem", color: "#555", marginBottom: "30px" }}
          >
            ¡Pronto nuevas funcionalidades de compras estarán disponibles!
          </p>
        </div>

        {/* Contenedor del video en el centro, con tamaño ajustado */}
        <div
          className="video-container"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
            width: "700px",
            height: "400px",
            position: "relative",
            backgroundColor: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "auto",
            marginBottom: "auto"
          }}
        >
          <video
            src="/videos/comingsoon.mp4"
            type="video/mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "20px"
            }}
          />
        </div>
      </div>

      {/* Estilos adicionales */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');

          /* Efecto de movimiento para el texto */
          .moving-text {
            animation: moveText 3s infinite alternate;
          }

          @keyframes moveText {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(10px);
            }
          }

          /* Degradado para el título */
          .gradient-text {
            background: linear-gradient(to right, #ff6f61, #ff8a5c, #ffd662);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          /* Sombra suave en la descripción */
          .shadow-text {
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
          }

          /* Ajustes para pantallas pequeñas (móviles) */
          @media (max-width: 768px) {
            .moving-text {
              font-size: 1.2rem !important; /* Tamaño más pequeño en móvil */
            }

            .description-text {
              font-size: 0.75rem !important; /* Descripción más pequeña en móvil */
            }

            .video-container {
              width: 100%;  /* El video ocupará el 100% del ancho disponible */
              height: auto;  /* Mantener la proporción del video */
              max-width: 350px;  /* Tamaño máximo para pantallas móviles */
            }

            video {
              width: 100% !important;
              height: auto !important;
              object-fit: cover !important;
            }
          }
        `}
      </style>
    </section>
  );
}
