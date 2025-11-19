import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Producto } from "../types/producto";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import {
  eliminarPublicacion,
  destacarPublicacion,
  activarTemporada,
  desactivarTemporada,
  obtenerTemporadas,
} from "../api/publicacionesService";

interface Props {
  producto: Producto;
  onEliminado?: (id: number) => void;
  mostrarAcciones?: boolean;
}

const ProductoCard: React.FC<Props> = ({
  producto,
  onEliminado,
  mostrarAcciones = false,
}) => {
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirm = await Swal.fire({
      title: "¿Eliminar publicación?",
      text: "Esta acción eliminará también las imágenes y videos asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#facc15",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1e1f23",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      setEliminando(true);

      Swal.fire({
        title: "Eliminando...",
        text: "Por favor, esperá un momento.",
        allowOutsideClick: false,
        showConfirmButton: false,
        background: "#1e1f23",
        color: "#fff",
        didOpen: () => Swal.showLoading(),
      });

      await eliminarPublicacion(producto.id);

      Swal.fire({
        icon: "success",
        title: "Publicación eliminada",
        timer: 2000,
        showConfirmButton: false,
        background: "#1e1f23",
        color: "#fff",
      });

      if (onEliminado) onEliminado(producto.id);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.message,
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setEliminando(false);
    }
  };

  return (
    <Link to={`/producto/${producto.id}`} className="block">
      <div
        className={`
          bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer 
          overflow-hidden flex flex-col h-full ring-1 ring-transparent hover:ring-yellow-500
          ${producto.esDestacada ? "ring-2 ring-yellow-400" : ""}
        `}
      >
        {/* Imagen */}
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-t-lg bg-black">
          {producto.esDestacada && (
            <div className="absolute top-2 left-2 bg-yellow-300 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
              ⭐ Publicación destacada
            </div>
          )}

          {producto.imagenes[0]?.mainUrl?.endsWith(".mp4") ? (
            <video
              src={producto.imagenes[0]?.mainUrl}
              className="w-full h-full object-cover absolute top-0 left-0"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <img
              src={
                producto.imagenes[0]?.thumbUrl || producto.imagenes[0]?.mainUrl
              }
              alt={producto.nombre}
              className="w-full h-full object-cover absolute top-0 left-0"
            />
          )}
        </div>

        {/* Contenido */}
        <div className="p-3 text-sm flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">
            {producto.nombre}
          </h3>

          <p className="text-green-600 font-bold text-sm mb-1">
            {producto.precio.toLocaleString()} ₲
          </p>

          <p className="text-xs text-gray-500">{producto.ubicacion}</p>

          {/* Fila: vendedor + editar + eliminar */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <img
                src={producto.vendedor.avatar}
                alt={producto.vendedor.nombre}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-gray-500">
                {producto.vendedor.nombre}
              </span>
            </div>

            {mostrarAcciones && (
              <div className="flex items-center gap-2">
                {/* Editar */}
                <button
                  className="text-gray-400 hover:text-blue-500 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    Swal.fire({
                      icon: "info",
                      title: "✨ ¡Estamos trabajando en ello!",
                      html: `
                        <p style="color: #ddd; font-size: 15px; margin-top: 8px;">
                          La edición de publicaciones estará disponible pronto.
                        </p>`,
                      background: "#1e1f23",
                      color: "#fff",
                      confirmButtonColor: "#22c55e",
                      confirmButtonText: "Entendido 💛",
                      showCloseButton: true,
                    });
                  }}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>

                {/* Eliminar */}
                <button
                  disabled={eliminando}
                  className={`transition ${
                    eliminando
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                  onClick={handleEliminar}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* 📌 FILA NUEVA: botones especiales */}
          {mostrarAcciones && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-200">
              {/* ⭐ DESTACAR */}
              <button
                disabled={producto.esDestacada}
                className={`
                  w-full text-xs py-2 rounded-md font-semibold transition flex items-center justify-center gap-1
                  ${
                    producto.esDestacada
                      ? "bg-yellow-300 text-black cursor-not-allowed"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }
                `}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (producto.esDestacada) return;

                  Swal.fire({
                    title: "⭐ Destacar publicación",
                    html: `
                      <p style="color:#ddd">Elegí cuántos días querés destacar.</p>
                      <select id="dias" class="swal2-input" style="color:black;">
                        <option value="7">7 días</option>
                        <option value="15">15 días</option>
                        <option value="30">30 días</option>
                      </select>
                    `,
                    showCancelButton: true,
                    confirmButtonText: "Destacar",
                    background: "#1e1f23",
                    color: "#fff",
                    preConfirm: () => {
                      const select = document.getElementById(
                        "dias"
                      ) as HTMLSelectElement;
                      return Number(select.value);
                    },
                  }).then(async (res) => {
                    if (!res.isConfirmed) return;

                    try {
                      await destacarPublicacion(producto.id, res.value);

                      Swal.fire({
                        icon: "success",
                        title: "⭐ Publicación destacada",
                        background: "#1e1e1e",
                        color: "#fff",
                        timer: 1800,
                        showConfirmButton: false,
                      });

                      window.dispatchEvent(
                        new Event("actualizar-publicaciones")
                      );
                    } catch (err: any) {
                      Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: err.message,
                        background: "#1e1e1e",
                        color: "#fff",
                      });
                    }
                  });
                }}
              >
                ⭐ Destacar
              </button>

              {/* 🎉 PUBLICACIÓN ESPECIAL */}
              <button
                className="
                    flex-1 text-xs font-semibold px-3 py-2 rounded-md
                    bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white
                    shadow-md hover:shadow-lg transition
                  "
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (producto.esTemporada) {
                    const confirm = await Swal.fire({
                      title: "¿Quitar de publicación especial?",
                      icon: "warning",
                      showCancelButton: true,
                      background: "#1e1f23",
                      color: "#fff",
                    });

                    if (!confirm.isConfirmed) return;

                    await desactivarTemporada(producto.id);
                    window.dispatchEvent(new Event("actualizar-publicaciones"));
                    return;
                  }

                  const temporadas = await obtenerTemporadas();

                  if (temporadas.length === 0) {
                    Swal.fire({
                      icon: "info",
                      title: "Sin temporadas",
                      text: "El administrador no configuró temporadas.",
                      background: "#1e1f23",
                      color: "#fff",
                    });
                    return;
                  }

                  const opciones = temporadas
                    .map((t) => `<option value="${t.id}">${t.nombre}</option>`)
                    .join("");

                  const res = await Swal.fire({
                    title: "🎉 Publicación especial",
                    html: `
                      <p style="color:#ccc;">Seleccioná la temporada:</p>
                      <select id="temporada" class="swal2-input" style="color:black;">
                        ${opciones}
                      </select>
                    `,
                    showCancelButton: true,
                    background: "#1e1f23",
                    color: "#fff",
                    confirmButtonText: "Activar",
                    preConfirm: () => {
                      const select = document.getElementById(
                        "temporada"
                      ) as HTMLSelectElement;
                      return Number(select.value);
                    },
                  });

                  if (!res.isConfirmed) return;

                  await activarTemporada(producto.id, res.value);

                  Swal.fire({
                    icon: "success",
                    title: "🎉 Activado como publicación especial",
                    background: "#1e1e1e",
                    color: "#fff",
                    timer: 1800,
                    showConfirmButton: false,
                  });

                  window.dispatchEvent(new Event("actualizar-publicaciones"));
                }}
              >
                🎉 Especial
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;
