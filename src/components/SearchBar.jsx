import React from "react";

function SearchBar({ placeholder, value, onChange, onClear }) {
  return (
    <div className="relative w-3/4 md:w-1/2">
      {/* Icono de lupa */}
      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.293 16.293a8 8 0 111.414-1.414l5.586 5.586a1 1 0 01-1.414 1.414l-5.586-5.586z"
          />
        </svg>
      </span>

      {/* Input del buscador */}
      <input
        type="text"
        placeholder={placeholder || "Buscar..."}
        className="w-full p-3 pl-10 pr-10 rounded-lg border border-gray-300 shadow-md hover:shadow-orange-300 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
        value={value} // Estado controlado
        onChange={onChange} // Llama a la función al escribir
      />

      {/* Botón para borrar */}
      {value && (
        <button
          type="button" // Aseguramos que el botón no envíe formularios
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={onClear} // Limpia el input
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
