import React from 'react';

function HeaderPage({ category }) {
  return (
    <header className="sticky top-0 z-50">
      {/* Barra superior negra */}
      <div className="bg-black text-white text-sm py-2 flex justify-between items-center px-4">
        <div className="flex items-center">
          <span className="mr-4 text-yellow-500">Llámanos: (0982 12 12 69) 521 060</span>
        </div>
        <div className="flex items-center">
          <a href="#" className="ml-4">Buscar</a>
        </div>
      </div>

      {/* Encabezado principal con logo y navegación */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          {/* Logo */}
          <div className="flex items-center">
            <img src="https://via.placeholder.com/100x50" alt="Logo Kenton" className="mr-4" />
          </div>

          {/* Menú de navegación */}
          <nav className="flex space-x-6">
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">INICIO</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">NOSOTROS</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">MOTOS</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">INMUEBLES</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">VEHICULOS</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">CONTACTO</a>
          </nav>
        </div>
      </div>

      {/* Segunda barra negra sin contenido */}
      <div className="bg-gray-900">
        {/* No se mostrará nada aquí */}
      </div>
    </header>
  );
}

export default HeaderPage;
