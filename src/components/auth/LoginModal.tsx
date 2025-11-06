// src/components/LoginModal.tsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { login, loginConGoogle } from "../../api/authService";
import Swal from "sweetalert2";
import { LoginResponseData, LoginRequest } from "../../types/auth.types";
import { useUsuario } from "../../context/UsuarioContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: (datosPrevios?: any) => void;
}

const LoginModal: React.FC<Props> = ({ open, onClose, onSwitchToRegister }) => {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const { setUsuario } = useUsuario();

  const handleLogin = async () => {
    try {
      const input = loginInput.trim();

      let payload: LoginRequest;

      if (input.includes("@")) {
        // 👉 Es un email
        payload = {
          email: input,
          clave: password,
          tipoLogin: "clasico",
        };
      } else {
        // 👉 Es un usuario
        payload = {
          usuarioLogin: input,
          clave: password,
          tipoLogin: "clasico",
        };
      }

      const data: LoginResponseData = await login(payload);

      if (data?.esNuevo) {
        // 🔹 Solo pasamos datosPrevios si vienen realmente del proveedor (Google)
        const tieneDatosPrevios =
          data.datosPrevios && data.datosPrevios.tipoLogin === "google";
        console.log(
          "Datos previos para registro:",
          tieneDatosPrevios ? data.datosPrevios : null
        );
        onSwitchToRegister(tieneDatosPrevios ? data.datosPrevios : null);
        return;
      }

      if (data?.parTokens?.bearerToken) {
        localStorage.setItem("token", data.parTokens.bearerToken);
        localStorage.setItem("usuario", data?.parUsuario?.nombreUsuario || "");
        localStorage.setItem("fotoUrl", ""); // clásico no trae foto

        // ✅ Guardamos todos los roles, no solo el primero
        const roles = data?.parUsuario?.roles || ["Comprador"];
        localStorage.setItem("roles", JSON.stringify(roles));
      }

      // 👇 Guardar en contexto
      setUsuario({
        nombreUsuario: data?.parUsuario?.nombreUsuario || "",
        fotoUrl: undefined, // clásico no trae foto
      });
      window.dispatchEvent(new Event("usuario-actualizado"));

      Swal.fire({
        icon: "success",
        title: "Sesión iniciada",
        text: "Bienvenido/a",
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    } catch (error: any) {
      let msg = "Error al iniciar sesión";

      if (error.response?.status === 401) {
        msg = "El usuario o la contraseña no son correctos.";
      } else if (error.response?.data?.Message) {
        msg = error.response.data.Message;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al iniciar sesión",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const nombre = result.user.displayName || "";
      const fotoUrl = result.user.photoURL || "";
      const proveedorId = result.user.providerData[0]?.uid;

      if (!email) throw new Error("No se pudo obtener el correo de Google");

      const data = await loginConGoogle({
        email,
        nombre,
        fotoUrl,
        proveedorId,
      });

      if (data.esNuevo) {
        onSwitchToRegister(data.datosPrevios);
      } else {
        localStorage.setItem("token", data.parTokens?.bearerToken || "");
        localStorage.setItem("usuario", nombre);
        localStorage.setItem("fotoUrl", fotoUrl);

        // ✅ Guardamos todos los roles, no solo el primero
        const roles = data?.parUsuario?.roles || ["Comprador"];
        localStorage.setItem("roles", JSON.stringify(roles));

        // 👇 Guardar en contexto
        setUsuario({
          nombreUsuario: nombre,
          fotoUrl: fotoUrl,
        });

        window.dispatchEvent(new Event("usuario-actualizado"));

        Swal.fire({
          icon: "success",
          title: "Sesión iniciada",
          timer: 3000,
          showConfirmButton: false,
        });
        onClose();
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error con Google",
        text: error.message || "Falló el login con Google",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-[90%] max-w-md text-white relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-yellow-400">
          Iniciar Sesión
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-white">Correo o usuario</label>
            <input
              type="text"
              autoComplete="username" // 👈 permite que autocomplete funcione bien pero aislado
              name="usuarioLogin"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>
          <div>
            <label className="text-sm text-white">Contraseña</label>
            <input
              type="password"
              autoComplete="current-password" // 👈 para campos de login
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          <button
            onClick={handleLogin}
            className="bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-300"
          >
            INICIAR SESIÓN
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-600" />
            <span className="mx-3 text-gray-400 text-sm">o ingresá con</span>
            <hr className="flex-grow border-t border-gray-600" />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="bg-white text-black py-2 px-4 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="Google"
                className="w-6 h-6"
              />
            </button>
          </div>

          <p className="text-sm text-center mt-2">
            ¿No tenés cuenta?{" "}
            <span
              onClick={() => {
                onClose(); // 🔹 Cierra el modal de login
                onSwitchToRegister(null); // 🔹 Abre el registro limpio
              }}
              className="text-yellow-400 cursor-pointer font-medium"
            >
              Registrate
            </span>
          </p>

          <p className="text-sm text-center mt-2">
            ¿Olvidaste tu contraseña?{" "}
            <span
              onClick={() => {
                onClose(); // cerrar login
                window.dispatchEvent(new Event("abrir-recuperar")); // abrir modal recuperar
              }}
              className="text-yellow-400 cursor-pointer font-medium"
            >
              Recuperar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
