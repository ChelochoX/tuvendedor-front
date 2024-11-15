import React from "react";
import { FaEye } from "react-icons/fa";

const AccesoAPagina = ({ accesos }) => {
  const colors = [
    "bg-yellow-100 border-l-4 border-yellow-500",
    "bg-blue-100 border-l-4 border-blue-500",
    "bg-green-100 border-l-4 border-green-500",
    "bg-red-100 border-l-4 border-red-500",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {accesos.map((acceso, index) => (
        <div
          key={acceso.id}
          className={`shadow-lg rounded-lg p-4 flex flex-col items-start ${
            colors[index % colors.length]
          }`}
        >
          <div className="flex items-center justify-between w-full mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {acceso.pagina}
            </h3>
            <FaEye className="text-gray-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{acceso.cantidad}</p>
          <span className="text-sm text-gray-500 mt-1">Accesos</span>
        </div>
      ))}
    </div>
  );
};

export default AccesoAPagina;
