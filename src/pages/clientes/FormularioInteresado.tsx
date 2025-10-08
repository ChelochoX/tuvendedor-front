import React, { useState, useEffect } from "react";
import {
  registrarInteresado,
  actualizarInteresado,
  registrarSeguimiento,
  obtenerSeguimientos,
} from "../../api/clientesService";
import {
  Interesado,
  Seguimiento,
  InteresadoRequest,
} from "../../types/clientes";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface Props {
  seleccionado: Interesado | null;
  setSeleccionado: (i: Interesado | null) => void;
  setRecargarLista: (v: boolean) => void;
  seguimientos: Seguimiento[];
  setSeguimientos: (v: Seguimiento[]) => void;
}

const FormularioInteresado: React.FC<Props> = ({
  seleccionado,
  setSeleccionado,
  setRecargarLista,
  seguimientos,
  setSeguimientos,
}) => {
  const navigate = useNavigate();

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

  useEffect(() => {
    if (seleccionado) {
      setFormInteresado({
        ...seleccionado,
        fechaProximoContacto: seleccionado.fechaProximoContacto
          ? seleccionado.fechaProximoContacto.split("T")[0]
          : "",
      });
      obtenerSeguimientos(seleccionado.id).then((data) => {
        setSeguimientos(data || []);
      });
    } else {
      limpiarFormulario();
    }
  }, [seleccionado]);

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
      setRecargarLista(true);
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

      Swal.fire({
        title: "Éxito",
        text: "Seguimiento registrado correctamente.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      setFormSeguimiento({ idInteresado: seleccionado.id, comentario: "" });
      const segs = await obtenerSeguimientos(seleccionado.id);
      setSeguimientos(segs);
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo registrar", "error");
    }
  };

  return (
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
                setFormInteresado({ ...formInteresado, nombre: e.target.value })
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
                setFormInteresado({ ...formInteresado, email: e.target.value })
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
                setFormInteresado({ ...formInteresado, ciudad: e.target.value })
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
            <label className="block mb-1 text-sm">Fecha próximo contacto</label>
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
                    if (/^\d*$/.test(valor)) {
                      setFormInteresado({
                        ...formInteresado,
                        cantidadAportes:
                          valor === "" ? undefined : parseInt(valor, 10),
                      });
                    }
                  }}
                  className="p-1.5 text-sm bg-gray-700 text-center rounded w-28 border border-yellow-500 focus:ring-2 focus:ring-yellow-400"
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
    </main>
  );
};

export default FormularioInteresado;
