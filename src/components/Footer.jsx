import React from "react";
import logo from "../assets/images/logoTuVendedor.png";
const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 px-4">
        {/* Logo e Información de Marca */}
        <div className="flex flex-col items-center md:items-start max-w-xs mb-4">
          <img src={logo} alt="Logo TuVendedor" className="w-80 h-auto mb-2" />

          {/* Descripción de Vendedor Autorizado */}
          <div className="text-yellow-500 font-bold text-lg text-center md:text-left">
            Vendedor autorizado por Chacomer
          </div>
        </div>

        {/* Enlaces de Navegación */}
        <div className="text-center md:text-left">
          <h3 className="text-yellow-500 font-semibold mb-2">Navegación</h3>
          <nav className="space-y-1">
            <a href="/" className="text-white hover:text-yellow-500">
              Inicio
            </a>
            <br />
            <a href="/nosotros" className="text-white hover:text-yellow-500">
              Nosotros
            </a>
            <br />
            <a href="/motos" className="text-white hover:text-yellow-500">
              Motos
            </a>
            <br />
            <a href="/inmuebles" className="text-white hover:text-yellow-500">
              Inmuebles
            </a>
            <br />
            <a href="/vehiculos" className="text-white hover:text-yellow-500">
              Vehículos
            </a>
            <br />
            <a href="/contacto" className="text-white hover:text-yellow-500">
              Contacto
            </a>
          </nav>
        </div>

        {/* Información de Contacto */}
        <div className="text-center md:text-left">
          <h3 className="text-yellow-500 font-semibold mb-2">Contáctanos</h3>
          <p className="text-yellow-500 font-semibold">
            Dirección: Gobernador Irala, Areguá, Paraguay
          </p>
          <p className="mt-4 text-white">
            ¿Quieres tener tu propio catálogo de productos? Comunícate con
            nosotros.
          </p>
          <p className="mt-2">
            Celular:{" "}
            <span className="text-yellow-500 font-bold">0982 12 12 69</span>
          </p>
          <p>
            Email:{" "}
            <a href="mailto:info@tuvendedor.com.py" className="text-yellow-500">
              info@tuvendedor.com.py
            </a>
          </p>

          {/* Icono de Facebook */}
          <div className="mt-4">
            <a
              href="https://www.facebook.com/motostuvendedor/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-white hover:text-yellow-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M22.675 0H1.325C.592 0 0 .593 0 1.326v21.348C0 23.408.592 24 1.325 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.787 4.659-4.787 1.325 0 2.462.099 2.794.143v3.24l-1.918.001c-1.503 0-1.794.715-1.794 1.763v2.31h3.588l-.467 3.622h-3.121V24h6.116C23.408 24 24 23.408 24 22.674V1.326C24 .593 23.408 0 22.675 0z" />
              </svg>
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>

      {/* Derechos reservados, créditos y enlaces legales */}
      <div className="border-t border-yellow-500 mt-6 pt-4 text-center">
        <p className="text-white">
          &copy; 2024 TuVendedor. Todos los derechos reservados.
        </p>
        <p className="text-yellow-500">
          Desarrollado por{" "}
          <a href="https://tuvendedor.com.py" className="hover:underline">
            TuVendedor
          </a>
        </p>
        <div className="space-x-4 mt-2">
          <a href="/terminos" className="text-white hover:underline">
            Términos y Condiciones
          </a>
          <a href="/privacidad" className="text-white hover:underline">
            Política de Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
