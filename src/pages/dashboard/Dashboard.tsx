import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold text-yellow-400 mb-2">
        Dashboard Global
      </h1>

      <p className="text-gray-300 mb-6">
        Resumen general del sistema: clientes, productos, ventas y actividad.
      </p>

      {/* Cards / métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-yellow-500 rounded-lg p-4">
          <h3 className="text-sm text-gray-400">Clientes activos</h3>
          <p className="text-3xl font-bold text-yellow-400">128</p>
        </div>

        <div className="bg-[#111827] border border-yellow-500 rounded-lg p-4">
          <h3 className="text-sm text-gray-400">Seguimientos del mes</h3>
          <p className="text-3xl font-bold text-yellow-400">47</p>
        </div>

        <div className="bg-[#111827] border border-yellow-500 rounded-lg p-4">
          <h3 className="text-sm text-gray-400">Nuevos interesados</h3>
          <p className="text-3xl font-bold text-yellow-400">22</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
