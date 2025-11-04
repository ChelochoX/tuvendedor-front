// src/context/UsuarioContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Usuario {
  nombreUsuario: string;
  fotoUrl?: string;
  rol?: string;
}

interface UsuarioContextType {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  cerrarSesion: () => void;

  // ✅ Helpers centralizados para roles y permisos
  esVisitante: boolean;
  esVendedor: boolean;
  esAdmin: boolean;
  puedePublicar: boolean;
  puedeVerClientes: boolean;
}

const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined);

export const UsuarioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // ✅ Cargar usuario desde localStorage al iniciar
  // ✅ Cargar usuario desde localStorage y actualizar dinámicamente
  useEffect(() => {
    const cargarUsuarioDesdeLocalStorage = () => {
      const token = localStorage.getItem("token");
      const nombreUsuario = localStorage.getItem("usuario");
      const fotoUrl = localStorage.getItem("fotoUrl");
      const rol = localStorage.getItem("rol");

      if (token && nombreUsuario) {
        setUsuario({
          nombreUsuario,
          fotoUrl: fotoUrl || undefined,
          rol: rol || undefined,
        });
      } else {
        setUsuario(null);
      }
    };

    // 🔹 Ejecutar al montar
    cargarUsuarioDesdeLocalStorage();

    // 🔹 Escuchar cambios globales (por ejemplo, desde LoginModal)
    window.addEventListener(
      "usuario-actualizado",
      cargarUsuarioDesdeLocalStorage
    );

    // 🔹 Limpieza
    return () => {
      window.removeEventListener(
        "usuario-actualizado",
        cargarUsuarioDesdeLocalStorage
      );
    };
  }, []);

  // ✅ Permite cerrar sesión globalmente
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoUrl");
    localStorage.removeItem("rol");
    setUsuario(null);
  };

  // 🔹 Helpers globales (evita duplicar lógica en los componentes)
  const esVisitante = !usuario;
  const esVendedor = usuario?.rol === "Vendedor";
  const esAdmin = usuario?.rol === "Administrador";
  const puedePublicar = esVendedor || esAdmin;
  const puedeVerClientes = esAdmin;

  return (
    <UsuarioContext.Provider
      value={{
        usuario,
        setUsuario,
        cerrarSesion,
        esVisitante,
        esVendedor,
        esAdmin,
        puedePublicar,
        puedeVerClientes,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

// ✅ Hook personalizado para acceder fácilmente
export const useUsuario = (): UsuarioContextType => {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error("useUsuario debe usarse dentro de UsuarioProvider");
  }
  return context;
};
