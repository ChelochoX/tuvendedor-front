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
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    usuarioLogin: "",
    email: "",
    clave: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    nombreNegocio: "",
    ruc: "",
    rubro: "",
    proveedor: "",
    proveedorId: "",
    fotoPerfil: "",
    tipoLogin: "clasico",
  });

  useEffect(() => {
    if (datosPrevios) {
      console.log("Datos previos recibidos:", datosPrevios);
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
  }, [datosPrevios]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generar usuarioLogin a partir de nombre completo
  const generarUsuarioLogin = (nombreCompleto: string): string => {
    if (!nombreCompleto.trim()) return "";

    const partes = nombreCompleto.trim().split(" ");
    if (partes.length < 2) return partes[0].toLowerCase();

    const inicial = partes[0][0].toLowerCase(); // primera letra del nombre
    const apellido = partes[1].toLowerCase(); // primer apellido
    return inicial + apellido;
  };

  // Verificar disponibilidad (función común)
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

  // Cuando cambia el nombre completo
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const generado = generarUsuarioLogin(value);

    setFormData((prev) => ({
      ...prev,
      nombreUsuario: value,
      usuarioLogin: generado, // se genera automáticamente
    }));

    // 🔥 Llamamos al back apenas generamos uno
    if (generado) {
      verificarDisponibilidad(generado);
    }
  };

  // Guardamos un timer global para debounce
  let debounceTimer: any;

  const handleUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      usuarioLogin: value,
    }));

    // Cancelamos cualquier request anterior
    if (debounceTimer) clearTimeout(debounceTimer);

    // Hacemos la validación después de 500ms sin teclear
    debounceTimer = setTimeout(() => {
      if (value.trim()) {
        verificarDisponibilidad(value);
      }
    }, 500);
  };

  // Cuando el usuario edita directamente el campo Usuario
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
          {/* campos comunes */}
          <div>
            <label className="text-sm text-white">Nombre Completo</label>
            <input
              type="text"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleNombreChange} // 👈 genera el usuarioLogin
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          {/* UsuarioLogin con validación */}
          <div>
            <label className="text-sm text-white">Usuario</label>
            <input
              type="text"
              name="usuarioLogin"
              value={formData.usuarioLogin || ""}
              onChange={handleUsuarioChange} // 👈 ahora valida mientras escribe
              onBlur={handleUsuarioBlur} // verifica disponibilidad al salir del campo
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
          {[
            { label: "Email", name: "email" },
            ...(formData.tipoLogin === "clasico"
              ? [{ label: "Password", name: "clave" }]
              : []),
            { label: "Teléfono", name: "telefono" },
            { label: "Ciudad", name: "ciudad" },
            { label: "Dirección", name: "direccion" },
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

          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={esVendedor}
              onChange={() => setEsVendedor(!esVendedor)}
              className="mr-2"
            />
            Deseo vender productos en la plataforma
          </label>

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
