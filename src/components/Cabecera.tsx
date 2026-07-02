import React from "react";
import { useUsuario } from "../context/UsuarioContext";

interface CabeceraProps {
  busqueda: string;
  setBusqueda: (value: string) => void;
}

const LOGO_TUVENDEDOR = "/logoTuVendedorDark.png";

const Cabecera: React.FC<CabeceraProps> = ({ busqueda, setBusqueda }) => {
  const { usuario, cerrarSesion } = useUsuario();

  const volverAlMarketplace = () => {
    window.dispatchEvent(new Event("cerrar-sidebar"));
    window.dispatchEvent(new CustomEvent("buscar-productos", { detail: "" }));
  };

  return (
    <header className="sticky top-0 z-[60] w-full border-b-2 border-[#facc15] bg-[linear-gradient(180deg,#050506_0%,#0b0d12_100%)] text-white shadow-lg">
      {/* ===========================================
          CABECERA ESCRITORIO
      ============================================ */}
      <div className="hidden h-16 items-center justify-between gap-4 px-5 md:flex">
        {/* Logo / Marca escritorio */}
        <button
          type="button"
          onClick={volverAlMarketplace}
          className="group flex min-w-[130px] shrink-0 items-center justify-start bg-transparent transition hover:scale-[1.01]"
          aria-label="Ir al inicio de TuVendedor"
        >
          <div className="flex h-11 w-[125px] items-center justify-start overflow-visible">
            <img
              src={LOGO_TUVENDEDOR}
              alt="TuVendedor"
              className="h-auto w-[88px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)] transition duration-200"
            />
          </div>
        </button>

        {/* Buscador centrado */}
        <div className="relative flex flex-1 justify-center">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-[430px] rounded-full border border-gray-300 bg-white px-4 py-2 pr-10 text-black shadow-sm transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-[calc(50%-215px+12px)] top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
              aria-label="Limpiar búsqueda"
            >
              ❌
            </button>
          )}
        </div>

        {/* Usuario */}
        {usuario ? (
          <div className="flex min-w-[210px] items-center justify-end gap-3">
            <img
              src={
                usuario.fotoUrl?.trim()
                  ? usuario.fotoUrl
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={usuario.nombreUsuario || "Usuario"}
              className="h-8 w-8 rounded-full border border-white/10 object-cover"
            />

            <span className="max-w-[130px] truncate text-sm font-semibold">
              {usuario.nombreUsuario}
            </span>

            <button
              onClick={cerrarSesion}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="flex min-w-[210px] justify-end">
            <button
              onClick={() => window.dispatchEvent(new Event("abrir-login"))}
              className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-bold text-black shadow-md transition hover:bg-yellow-300"
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>

      {/* ===========================================
          CABECERA MOBILE
      ============================================ */}
      <div className="flex flex-col gap-2 px-4 py-3 md:hidden">
        {/* Línea 1: menú + logo + usuario */}
        <div className="relative flex min-h-[48px] items-center justify-between">
          {/* Botón hamburguesa */}
          <button
            onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
            className="z-10 flex h-10 w-10 items-center justify-center rounded-full text-2xl transition hover:bg-white/10"
            aria-label="Abrir menú"
          >
            ☰
          </button>

          {/* Logo centrado mobile */}
          <button
            type="button"
            onClick={volverAlMarketplace}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-transparent"
            aria-label="Ir al inicio de TuVendedor"
          >
            <img
              src={LOGO_TUVENDEDOR}
              alt="TuVendedor"
              className="h-auto w-[122px] object-contain drop-shadow-[0_5px_14px_rgba(0,0,0,0.6)]"
            />
          </button>

          {/* Usuario */}
          {usuario ? (
            <div className="z-10 flex items-center gap-2">
              <img
                src={
                  usuario.fotoUrl?.trim()
                    ? usuario.fotoUrl
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={usuario.nombreUsuario || "Usuario"}
                className="h-7 w-7 rounded-full border border-white/10 object-cover"
              />

              <button
                onClick={cerrarSesion}
                className="rounded-full bg-red-500 px-3 py-1 text-xs text-white transition hover:bg-red-400"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new Event("abrir-login"))}
              aria-label="Iniciar sesión"
              className="z-10 min-w-[76px] rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black shadow-md transition hover:bg-yellow-300"
            >
              Ingresar
            </button>
          )}
        </div>

        {/* Nombre del usuario debajo */}
        {usuario && (
          <div className="-mt-1 pr-3 text-right text-xs font-medium opacity-90">
            {usuario.nombreUsuario}
          </div>
        )}

        {/* Buscador mobile */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-full border border-gray-300 bg-white px-3 py-2 pr-9 text-sm text-black shadow-sm transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
              aria-label="Limpiar búsqueda"
            >
              ❌
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Cabecera;
