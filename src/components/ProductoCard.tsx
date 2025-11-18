import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Producto } from "../types/producto";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import {
  eliminarPublicacion,
  destacarPublicacion,
} from "../api/publicacionesService"; // <-- 🔥 AGREGADO

interface Props {
  producto: Producto;
  onEliminado?: (id: number) => void;
  mostrarAcciones?: boolean; // 🔹 nueva prop
}

const ProductoCard: React.FC<Props> = ({
  producto,
  onEliminado,
  mostrarAcciones = false,
}) => {
  const [favorito, setFavorito] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // 🔹 Maneja la eliminación con confirmación SweetAlert2
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
        text: "El producto fue eliminado correctamente.",
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
        text: error.message || "Ocurrió un error inesperado.",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setEliminando(false);
    }
  };

  return (
    <Link to={`/producto/${producto.id}`} className="block">
      {/* 🔥 AGREGADO → borde dorado si es destacada */}
      <div
        className={`
          bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer 
          overflow-hidden ring-1 ring-transparent hover:ring-yellow-500 flex flex-col h-full
          ${producto.esDestacada ? "ring-2 ring-yellow-400" : ""}
        `}
      >
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-t-lg bg-black">
          {/* 🔥 AGREGADO → badge ⭐ */}
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

        <div className="p-3 text-sm relative flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">
            {producto.nombre}
          </h3>

          <p className="text-green-600 font-bold text-sm mb-1">
            {producto.precio.toLocaleString()} ₲
          </p>

          <p className="text-xs text-gray-500">{producto.ubicacion}</p>

          <div className="flex items-center justify-between mt-auto">
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

            {/* 🔹 Solo muestra los botones si mostrarAcciones = true */}
            {mostrarAcciones && (
              <div className="flex gap-2">
                {/* 🔥 AGREGADO → Botón Destacar */}
                <button
                  disabled={producto.esDestacada}
                  className={`
    font-semibold text-xs px-3 py-1 rounded-md transition
    ${
      producto.esDestacada
        ? "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black cursor-not-allowed shadow-md"
        : "text-yellow-500 bg-black/5 hover:text-yellow-400"
    }
  `}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (producto.esDestacada) {
                      Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "info",
                        title: "Esta publicación ya está destacada",
                        timer: 1600,
                        background: "#1e1e1e",
                        color: "#fff",
                        showConfirmButton: false,
                      });
                      return;
                    }

                    Swal.fire({
                      title: "⭐ Destacar publicación",
                      html: `
        <p style="color:#ddd">Esta publicación tendrá mayor visibilidad.</p>
        <p style="color:#facc15;font-weight:bold;margin-top:8px;">
          ¿Por cuántos días querés destacar?
        </p>
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
                  {producto.esDestacada ? "⭐ Destacado" : "⭐ Destacar"}
                </button>

                {/* Botón Editar */}
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
                          En este momento estamos desarrollando la opción de <b>editar publicaciones</b>
                          para que puedas actualizar tus productos fácilmente. 💪
                        </p>
                        <p style="color: #ddd; font-size: 14px; margin-top: 10px;">
                          Mientras tanto, podés <b>eliminar</b> tu publicación y crear una nueva con los cambios que necesites.
                        </p>
                        <p style="color: #facc15; font-weight: bold; margin-top: 12px;">
                          🛠️ ¡Muy pronto estará disponible esta funcionalidad!
                        </p>
                      `,
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

                {/* Botón Eliminar */}
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
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;
