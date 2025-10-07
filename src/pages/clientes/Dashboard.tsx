import React from "react";
import Panel from "./Panel";

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Panel lateral */}
      <aside className="w-64 border-r border-yellow-400 p-4">
        <Panel />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">
          Gestión de Clientes
        </h1>
        <p className="text-gray-300">
          Desde aquí podrás registrar nuevos interesados, agregar seguimientos y
          consultar el historial de tus clientes.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
