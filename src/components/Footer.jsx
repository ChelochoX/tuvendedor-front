import React from "react";
import logo from "../assets/images/logoTuVendedor.png";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 px-4">
        {/* Logo e Información de Marca con ancho limitado */}
        <div className="flex flex-col items-center md:items-start max-w-xs">
          {" "}
          {/* Ajuste de ancho con max-w-xs */}
          <img
            src={logo}
            alt="Logo TuVendedor"
            className="w-80 h-auto mb-4"
          />{" "}
          {/* Tamaño grande del logo */}
          <p className="text-yellow-500 font-bold text-lg text-center md:text-left">
            TU MEJOR OPCIÓN EN VENTAS
          </p>
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
          <p>
            Dirección: Feliciano Baez No 33 c/ Gobernador Irala, Areguá,
            Paraguay
          </p>
          <p>
            Celular: <span className="text-yellow-500">0994 60 60 48</span>
          </p>
          <p>
            Email:{" "}
            <a href="mailto:info@tuvendedor.com.py" className="text-yellow-500">
              info@tuvendedor.com.py
            </a>
          </p>
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
