import React, { useEffect, useState } from "react";
import { register, verificarUsuarioLogin } from "../../api/authService";
import Swal from "sweetalert2";

interface Props {
  open: boolean;
  onClose: () => void;
  datosPrevios?: {
    email?: string;
    nombre?: string;
    fotoUrl?: string;
    tipoLogin?: string;
    proveedor?: string;
    proveedorId?: string;
  } | null;
}

const RegisterModal: React.FC<Props> = ({ open, onClose, datosPrevios }) => {
  const [esVendedor, setEsVendedor] = useState(false);
  const [usuarioDisponible, setUsuarioDisponible] = useState<boolean | null>(
    null
  );
  const [checkingUsuario, setCheckingUsuario] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false); // 👁️ Nuevo estado
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    usuarioLogin: "",
    email: "",
    clave: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    sexo: "",
    nombreNegocio: "",
    ruc: "",
    rubro: "",
    proveedor: "",
    proveedorId: "",
    fotoPerfil: "",
    tipoLogin: "clasico",
  });

  useEffect(() => {
    if (!open) return;

    // 🧹 Si el registro NO viene de Google → limpiar todo
    if (!datosPrevios || datosPrevios?.tipoLogin !== "google") {
      console.log("🧹 Registro clásico o sin datos → limpiando formulario");
      setFormData({
        nombreUsuario: "",
        usuarioLogin: "",
        email: "",
        clave: "",
        telefono: "",
        ciudad: "",
        direccion: "",
        sexo: "",
        nombreNegocio: "",
        ruc: "",
        rubro: "",
        proveedor: "",
        proveedorId: "",
        fotoPerfil: "",
        tipoLogin: "clasico",
      });
      setUsuarioDisponible(null);
      setCheckingUsuario(false);
      setEsVendedor(false);
      setMostrarClave(false);
    } else {
      // 🧩 Si viene de Google → precargar datos
      console.log("🟢 Registro con Google detectado, precargando datos");
      setFormData((prev) => ({
        ...prev,
        nombreUsuario: datosPrevios.nombre || "",
        email: datosPrevios.email || "",
        proveedor: datosPrevios.proveedor || datosPrevios.tipoLogin || "",
        proveedorId: datosPrevios.proveedorId || "",
        fotoPerfil: datosPrevios.fotoUrl || "",
        tipoLogin: datosPrevios.tipoLogin || "clasico",
      }));
    }
  }, [open, datosPrevios]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generarUsuarioLogin = (nombreCompleto: string): string => {
    if (!nombreCompleto.trim()) return "";
    const partes = nombreCompleto.trim().split(" ");
    if (partes.length < 2) return partes[0].toLowerCase();
    const inicial = partes[0][0].toLowerCase();
    const apellido = partes[1].toLowerCase();
    return inicial + apellido;
  };

  const verificarDisponibilidad = async (usuario: string) => {
    if (!usuario.trim()) return;
    try {
      setCheckingUsuario(true);
      const disponible = await verificarUsuarioLogin(usuario.trim());
      setUsuarioDisponible(disponible);
    } catch (err: any) {
      setUsuarioDisponible(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo verificar el nombre de usuario",
      });
    } finally {
      setCheckingUsuario(false);
    }
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const generado = generarUsuarioLogin(value);
    setFormData((prev) => ({
      ...prev,
      nombreUsuario: value,
      usuarioLogin: generado,
    }));
    if (generado) {
      verificarDisponibilidad(generado);
    }
  };

  let debounceTimer: any;

  const handleUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      usuarioLogin: value,
    }));
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (value.trim()) {
        verificarDisponibilidad(value);
      }
    }, 500);
  };

  const handleUsuarioBlur = async () => {
    if (formData.usuarioLogin) {
      await verificarDisponibilidad(formData.usuarioLogin);
    }
  };

  const handleSubmit = async () => {
    if (usuarioDisponible === false) {
      Swal.fire({
        icon: "error",
        title: "Nombre de usuario en uso",
        text: "Por favor elegí otro usuario.",
      });
      return;
    }

    try {
      await register({ ...formData, esVendedor });
      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Ya podés iniciar sesión",
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    } catch (error: any) {
      const msg =
        error.response?.data?.Message ||
        error.response?.data?.Errors?.[0] ||
        error.message;

      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: msg,
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-[90%] max-w-md text-white relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-xl z-10"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Registrarse</h2>

        <div className="flex flex-col gap-3 pb-6">
          {/* Nombre completo */}
          <div>
            <label className="text-sm text-white">Nombre Completo</label>
            <input
              type="text"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleNombreChange}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          {/* Usuario */}
          <div>
            <label className="text-sm text-white">Usuario</label>
            <input
              type="text"
              name="usuarioLogin"
              autoComplete="off" // 👈 evita inyección automática del login anterior
              value={formData.usuarioLogin}
              onChange={handleUsuarioChange}
              onBlur={handleUsuarioBlur}
              className="w-full px-4 py-2 rounded bg-gray-200 text-black"
            />
            {checkingUsuario && (
              <p className="text-yellow-400 text-xs mt-1">
                Verificando disponibilidad...
              </p>
            )}
            {usuarioDisponible === true && (
              <p className="text-green-400 text-xs mt-1">✅ Disponible</p>
            )}
            {usuarioDisponible === false && (
              <p className="text-red-400 text-xs mt-1">❌ Ya está en uso</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-white">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          {/* Password (solo si tipoLogin = clasico) */}
          {formData.tipoLogin === "clasico" && (
            <div className="relative">
              <label className="text-sm text-white">Password</label>
              <input
                type={mostrarClave ? "text" : "password"}
                name="clave"
                autoComplete="new-password" // 👈 Chrome entiende que es una nueva clave, no la guardada
                value={formData.clave}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-white text-black pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="absolute right-3 top-8 text-gray-600 hover:text-yellow-400"
              >
                {mostrarClave ? "🙈" : "👁️"}
              </button>
            </div>
          )}

          {/* Teléfono */}
          <div>
            <label className="text-sm text-white">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          {/* Ciudad */}
          <div>
            <label className="text-sm text-white">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="text-sm text-white">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          {/* Sexo */}
          <div>
            <label className="text-sm text-white">Sexo</label>
            <select
              name="sexo"
              value={(formData as any).sexo || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-white text-black"
            >
              <option value="">Seleccioná una opción</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>

          {/* Checkbox vendedor */}
          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={esVendedor}
              onChange={() => setEsVendedor(!esVendedor)}
              className="mr-2"
            />
            Deseo vender productos en la plataforma
          </label>

          {/* Campos adicionales si es vendedor */}
          {esVendedor && (
            <>
              {[
                { label: "Nombre del Negocio", name: "nombreNegocio" },
                { label: "RUC", name: "ruc" },
                { label: "Rubro", name: "rubro" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="text-sm text-white">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded bg-white text-black"
                  />
                </div>
              ))}
            </>
          )}

          <button
            onClick={handleSubmit}
            className="bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-300"
          >
            REGISTRARSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
