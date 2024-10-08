import React, { useState } from 'react';

function Sidebar({ categories, setCategory }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  return (
    <div 
     className="w-1/5 h-96 border p-2 transition-transform transform hover:scale-105 shadow-lg rounded-lg hover:shadow-xl sticky top-40 overflow-y-auto"
    >
      <h2 className="text-lg font-bold mb-2 underline decoration-2 decoration-gray-300">CATEGORIAS</h2>
      <ul className="space-y-1">
        {categories.map((category, index) => (
          <li
            key={index}
            className={`py-1 px-3 cursor-pointer transition-colors 
              ${activeCategory === category ? 'font-semibold text-orange-500' : 'text-gray-700'}
              hover:bg-yellow-100 hover:text-orange-500 hover:underline rounded transition-transform transform hover:scale-105
              ${category === 'PROMOCIONES' ? 'text-red-500 font-bold animate-shake-pause' : ''}`}  // Efecto de sacudida con pausas para PROMOCIONES
            onClick={() => {
              setActiveCategory(category);
              setCategory(category);
            }}
          >
            {category}
          </li>
        ))}
      </ul>

      {/* Estilos personalizados para el efecto de sacudida con pausas */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-shake-pause {
          animation: shake 3s ease 5s infinite; /* 3 segundos de sacudida, 5 segundos de pausa */
        }
      `}</style>
    </div>
  );
}

export default Sidebar;
