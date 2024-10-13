import React, { useState, useEffect } from 'react';

function Sidebar({ categories, setCategory }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [isOpen, setIsOpen] = useState(false); // Por defecto cerrado en todos los tamaños de pantalla

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón para abrir/cerrar el Sidebar en todos los tamaños de pantalla */}
      <button
        className="fixed top-28 left-4 z-50 p-2 bg-yellow-500 text-black font-bold rounded-lg shadow-md"
        onClick={toggleSidebar}
      >
        Categorías
      </button>

      {/* Contenedor del Sidebar */}
      <div
        className={`bg-white shadow-lg p-4 rounded-lg transition-transform 
          ${isOpen ? 'block' : 'hidden'} 
          fixed top-36 left-16 w-3/4 h-auto z-40 md:w-64 md:h-auto md:fixed md:top-40`}
      >
        <h2 className="text-lg font-bold mb-2 underline decoration-2 decoration-gray-300">
          CATEGORÍAS
        </h2>
        <ul className="space-y-1">
          {categories.map((category, index) => (
            <li
              key={index}
              className={`py-1 px-3 cursor-pointer transition-colors 
                ${activeCategory === category ? 'font-semibold text-orange-500' : 'text-gray-700'}
                hover:bg-yellow-100 hover:text-orange-500 hover:underline rounded
                ${category === 'PROMOCIONES' ? 'text-red-500 font-bold animate-confetti' : ''}`} // Efecto "confetti" para PROMOCIONES
              onClick={() => {
                setActiveCategory(category);
                setCategory(category);
                setIsOpen(false); // Cerrar el sidebar después de seleccionar una categoría
              }}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>

      {/* Fondo oscuro para cerrar el Sidebar al hacer clic fuera en cualquier tamaño de pantalla */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}

export default Sidebar;
