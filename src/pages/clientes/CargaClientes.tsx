// src/pages/clientes/GestionClientes.tsx
import React, { useEffect, useState } from "react";
import {
  obtenerInteresados,
  obtenerSeguimientos,
  registrarInteresado,
  registrarSeguimiento,
  actualizarInteresado, // 👈 debes agregar esta función en clientesService
} from "../../api/clientesService";
import {
  Interesado,
  Seguimiento,
  InteresadoRequest,
} from "../../types/clientes";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const GestionClientes: React.FC = () => {
  const navigate = useNavigate();
  const [interesados, setInteresados] = useState<Interesado[]>([]);
  const [seleccionado, setSeleccionado] = useState<Interesado | null>(null);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [filtros, setFiltros] = useState({
    nombre: "",
    estado: "",
    fechaDesde: new Date().toISOString().split("T")[0],
    fechaHasta: "",
    numeroPagina: 1,
    registrosPorPagina: 10,
  });

  // 👇 Usamos un solo formulario, que cambia según si hay seleccionado o no
  const [formInteresado, setFormInteresado] = useState<
    Partial<InteresadoRequest & Interesado>
  >({
    aportaIPS: false,
    cantidadAportes: 0,
  });

  const [formSeguimiento, setFormSeguimiento] = useState({
    idInteresado: 0,
    comentario: "",
  });

  // 🔹 Obtener interesados con filtros y paginación
  const cargarInteresados = async () => {
    try {
      const data = await obtenerInteresados({
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta || undefined,
        nombre: filtros.nombre,
        estado: filtros.estado,
        numeroPagina: filtros.numeroPagina,
        registrosPorPagina: filtros.registrosPorPagina,
      });
      setInteresados(data.items || []);
      setTotalRegistros(data.totalRegistros);
    } catch {
      Swal.fire("Error", "No se pudieron obtener los interesados", "error");
    }
  };

  useEffect(() => {
    cargarInteresados();
  }, [filtros.numeroPagina, filtros.registrosPorPagina]);

  // 🔹 Seleccionar interesado
  const handleSeleccionar = async (interesado: Interesado) => {
    setSeleccionado(interesado);
    setFormInteresado(interesado);
    const segs = await obtenerSeguimientos(interesado.id);
    setSeguimientos(segs || []);
  };

  // 🔹 Vaciar formulario
  const limpiarFormulario = () => {
    setSeleccionado(null);
    setFormInteresado({
      nombre: "",
      telefono: "",
      email: "",
      ciudad: "",
      productoInteres: "",
      fechaProximoContacto: "",
      descripcion: "",
      aportaIPS: false,
      cantidadAportes: 0,
      archivoConversacion: null,
    });
    setSeguimientos([]);
  };

  // 🔹 Guardar interesado (nuevo o editar)
  const handleGuardarInteresado = async () => {
    try {
      if (formInteresado.aportaIPS && !formInteresado.cantidadAportes) {
        Swal.fire(
          "Atención",
          "Debe indicar la cantidad de aportes de IPS.",
          "warning"
        );
        return;
      }

      if (seleccionado) {
        // 🔸 Editar
        await actualizarInteresado(formInteresado as Interesado);
        Swal.fire({
          title: "Actualización exitosa",
          text: "Los datos del interesado fueron actualizados.",
          icon: "success",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        await registrarInteresado(formInteresado as InteresadoRequest);
        Swal.fire({
          title: "Registro exitoso",
          text: "El interesado se guardó correctamente.",
          icon: "success",
          timer: 1800,
          showConfirmButton: false,
        });
      }

      limpiarFormulario();
      cargarInteresados();
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo guardar", "error");
    }
  };

  // 🔹 Registrar seguimiento
  const handleRegistrarSeguimiento = async () => {
    if (!seleccionado)
      return Swal.fire("Atención", "Debe seleccionar un interesado", "warning");
    if (!formSeguimiento.comentario.trim())
      return Swal.fire("Atención", "Debe escribir un comentario", "info");

    try {
      await registrarSeguimiento({
        idInteresado: seleccionado.id,
        comentario: formSeguimiento.comentario,
      });
      Swal.fire("Éxito", "Seguimiento registrado", "success");
      setFormSeguimiento({ idInteresado: seleccionado.id, comentario: "" });
      const segs = await obtenerSeguimientos(seleccionado.id);
      setSeguimientos(segs);
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo registrar", "error");
    }
  };

  // 🔹 Paginación
  const totalPaginas = Math.ceil(totalRegistros / filtros.registrosPorPagina);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      {/* Panel Izquierdo - Filtros + Lista */}
      <aside className="md:w-1/3 w-full p-3 border-b md:border-b-0 md:border-r border-yellow-400">
        <h2 className="text-lg font-semibold text-yellow-400 mb-2">
          Interesados
        </h2>

        {/* 🔹 Filtros */}
        <div className="space-y-2 mb-4 text-sm">
          <div>
            <label className="block text-gray-300 mb-1">Nombre:</label>
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={filtros.nombre}
              onChange={(e) =>
                setFiltros({ ...filtros, nombre: e.target.value })
              }
              className="w-full p-1.5 text-sm rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) =>
                setFiltros({ ...filtros, estado: e.target.value })
              }
              className="w-full p-1.5 text-sm rounded bg-gray-800 border border-gray-600"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Fecha desde:</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) =>
                setFiltros({ ...filtros, fechaDesde: e.target.value })
              }
              className="w-full p-1.5 text-sm rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Fecha hasta:</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) =>
                setFiltros({ ...filtros, fechaHasta: e.target.value })
              }
              className="w-full p-1.5 text-sm rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <button
            onClick={() => {
              setFiltros({ ...filtros, numeroPagina: 1 });
              cargarInteresados();
            }}
            className="w-full bg-yellow-500 text-black font-semibold py-1.5 rounded hover:bg-yellow-400 transition mt-2"
          >
            Buscar
          </button>
        </div>

        {/* 🔹 Lista de interesados */}
        <ul className="divide-y divide-gray-700 space-y-1 text-sm">
          {interesados.map((i) => (
            <li
              key={i.id}
              onClick={() => handleSeleccionar(i)}
              className={`p-2 cursor-pointer rounded transition ${
                seleccionado?.id === i.id
                  ? "bg-gray-700 border-l-4 border-yellow-400"
                  : "hover:bg-gray-800"
              }`}
            >
              <strong>{i.nombre}</strong>
              <p className="text-xs text-gray-400">
                {i.ciudad || "Sin ciudad"} —{" "}
                {i.productoInteres || "Sin interés"}
              </p>
            </li>
          ))}
        </ul>

        {/* 🔹 Paginación */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-xs text-gray-300 gap-2">
          <div className="flex items-center gap-2">
            <label>Mostrar:</label>
            <select
              value={filtros.registrosPorPagina}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  registrosPorPagina: parseInt(e.target.value),
                  numeroPagina: 1,
                })
              }
              className="bg-gray-800 border border-gray-600 rounded p-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="whitespace-nowrap">
              Página {filtros.numeroPagina} de {totalPaginas} — Total:{" "}
              {totalRegistros}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFiltros((prev) => ({
                    ...prev,
                    numeroPagina: Math.max(1, prev.numeroPagina - 1),
                  }))
                }
                disabled={filtros.numeroPagina <= 1}
                className="px-2 py-1 bg-gray-800 rounded disabled:opacity-50"
              >
                ◀
              </button>
              <button
                onClick={() =>
                  setFiltros((prev) => ({
                    ...prev,
                    numeroPagina: Math.min(totalPaginas, prev.numeroPagina + 1),
                  }))
                }
                disabled={filtros.numeroPagina >= totalPaginas}
                className="px-2 py-1 bg-gray-800 rounded disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Panel Derecho - Formulario + Seguimientos */}
      <main className="flex-1 p-4 overflow-auto space-y-4">
        {/* 🔹 Formulario Interesado */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-sm">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <h3 className="text-yellow-400 font-semibold text-base">
              {seleccionado
                ? `Editar interesado: ${seleccionado.nombre}`
                : "Registrar nuevo interesado"}
            </h3>
            <button
              onClick={limpiarFormulario}
              className="text-xs px-2 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition"
            >
              Vaciar
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-sm">Nombre</label>
              <input
                type="text"
                value={formInteresado.nombre || ""}
                onChange={(e) =>
                  setFormInteresado({
                    ...formInteresado,
                    nombre: e.target.value,
                  })
                }
                className="p-1.5 text-sm bg-gray-700 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Teléfono</label>
              <input
                type="text"
                value={formInteresado.telefono || ""}
                onChange={(e) =>
                  setFormInteresado({
                    ...formInteresado,
                    telefono: e.target.value,
                  })
                }
                className="p-1.5 text-sm bg-gray-700 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                type="email"
                value={formInteresado.email || ""}
                onChange={(e) =>
                  setFormInteresado({
                    ...formInteresado,
                    email: e.target.value,
                  })
                }
                className="p-1.5 text-sm bg-gray-700 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Ciudad</label>
              <input
                type="text"
                value={formInteresado.ciudad || ""}
                onChange={(e) =>
                  setFormInteresado({
                    ...formInteresado,
                    ciudad: e.target.value,
                  })
                }
                className="p-1.5 text-sm bg-gray-700 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Producto de interés</label>
              <input
                type="text"
                value={formInteresado.productoInteres || ""}
                onChange={(e) =>
                  setFormInteresado({
                    ...formInteresado,
                    productoInteres: e.target.value,
                  })
                }
                className="p-1.5 text-sm bg-gray-700 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">
                Fecha próximo contacto
              </label>
              <input
                type="date"
                value={formInteresado.fechaProximoContacto || ""}
                onChange={(e) =>
                  setFormInteresado({
                    ...formInteresado,
                    fechaProximoContacto: e.target.value,
                  })
                }
                className="p-1.5 text-sm bg-gray-700 rounded w-full"
              />
            </div>

            {/* 🔹 Aporta IPS + Cantidad de aportes */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={formInteresado.aportaIPS || false}
                  onChange={(e) =>
                    setFormInteresado({
                      ...formInteresado,
                      aportaIPS: e.target.checked,
                      cantidadAportes: e.target.checked
                        ? formInteresado.cantidadAportes || 0
                        : 0,
                    })
                  }
                  className="w-4 h-4 accent-yellow-400 cursor-pointer"
                />
                Aporta IPS
              </label>

              {formInteresado.aportaIPS && (
                <div className="flex items-center gap-2 sm:ml-3">
                  <label className="text-sm text-gray-300 whitespace-nowrap">
                    Cantidad:
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ej: 5"
                    value={
                      formInteresado.cantidadAportes === 0 &&
                      !formInteresado.aportaIPS
                        ? ""
                        : formInteresado.cantidadAportes?.toString() || ""
                    }
                    onChange={(e) => {
                      const valor = e.target.value;

                      // Aceptar solo dígitos o vacío
                      if (/^\d*$/.test(valor)) {
                        setFormInteresado({
                          ...formInteresado,
                          cantidadAportes:
                            valor === "" ? undefined : parseInt(valor, 10),
                        });
                      }
                    }}
                    className="p-1.5 text-sm bg-gray-700 text-center rounded w-28 custom-number-input border border-yellow-500 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1 text-sm">
                Archivo de conversación
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFormInteresado({
                    ...formInteresado,
                    archivoConversacion: file,
                  });
                }}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1 text-sm">Descripción</label>
              <textarea
                rows={3}
                value={formInteresado.descripcion || ""}
                onChange={(e) =>
                  setFormInteresado({
                    ...formInteresado,
                    descripcion: e.target.value,
                  })
                }
                className="w-full p-1.5 text-sm bg-gray-700 rounded"
              />
            </div>
          </div>

          <button
            onClick={handleGuardarInteresado}
            className="mt-3 w-full bg-yellow-500 text-black font-semibold py-1.5 rounded hover:bg-yellow-400 transition"
          >
            {seleccionado ? "Actualizar" : "Registrar"}
          </button>
        </div>

        {/* 🔹 Seguimientos */}
        {seleccionado && (
          <div className="bg-gray-800 p-4 rounded-lg shadow-md text-sm">
            <h3 className="text-yellow-400 font-semibold text-base mb-2">
              Seguimientos de {seleccionado.nombre}
            </h3>

            {seguimientos.length > 0 ? (
              <ul className="divide-y divide-gray-700 mb-3">
                {seguimientos.map((s) => (
                  <li key={s.id} className="py-1.5">
                    <p className="text-gray-300">{s.comentario}</p>
                    <span className="text-xs text-gray-500">
                      📅 {new Date(s.fecha).toLocaleDateString()} — 👤{" "}
                      {s.usuario || "Sin usuario"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 mb-3 text-xs">
                No hay seguimientos registrados aún.
              </p>
            )}

            <textarea
              placeholder="Agregar nuevo seguimiento..."
              value={formSeguimiento.comentario}
              onChange={(e) =>
                setFormSeguimiento({
                  ...formSeguimiento,
                  comentario: e.target.value,
                })
              }
              className="w-full p-1.5 text-sm rounded bg-gray-700 mb-2"
            />
            <button
              onClick={handleRegistrarSeguimiento}
              className="bg-yellow-500 text-black font-semibold px-3 py-1.5 rounded hover:bg-yellow-400 transition text-sm"
            >
              Agregar seguimiento
            </button>
          </div>
        )}
        {/* 🔹 Botón Volver al final */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full border border-yellow-400 
               text-yellow-400 font-semibold text-sm transition-all duration-300 
               hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_10px_rgba(250,204,21,0.6)]"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span>Volver</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default GestionClientes;
