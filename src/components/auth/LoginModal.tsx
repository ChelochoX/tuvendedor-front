// src/components/auth/LoginModal.tsx
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

const LOGO_TUVENDEDOR = "/logoTuVendedorDark.png";

const LoginModal: React.FC<Props> = ({ open, onClose, onSwitchToRegister }) => {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const { setUsuario } = useUsuario();

  const handleLogin = async () => {
    try {
      const input = loginInput.trim();

      let payload: LoginRequest;

      if (input.includes("@")) {
        payload = {
          email: input,
          clave: password,
          tipoLogin: "clasico",
        };
      } else {
        payload = {
          usuarioLogin: input,
          clave: password,
          tipoLogin: "clasico",
        };
      }

      const data: LoginResponseData = await login(payload);

      if (data?.esNuevo) {
        const tieneDatosPrevios =
          data.datosPrevios && data.datosPrevios.tipoLogin === "google";

        onSwitchToRegister(tieneDatosPrevios ? data.datosPrevios : null);
        return;
      }

      if (data?.parTokens?.bearerToken) {
        localStorage.setItem("token", data.parTokens.bearerToken);
        localStorage.setItem("usuario", data?.parUsuario?.nombreUsuario || "");
        localStorage.setItem("fotoUrl", "");

        const roles = data?.parUsuario?.roles || ["Comprador"];
        const permisos = data?.parUsuario?.permisos || [];

        localStorage.setItem("roles", JSON.stringify(roles));
        localStorage.setItem("permisos", JSON.stringify(permisos));
      }

      setUsuario({
        nombreUsuario: data?.parUsuario?.nombreUsuario || "",
        fotoUrl: undefined,
        roles: data?.parUsuario?.roles || ["Comprador"],
        permisos: data?.parUsuario?.permisos || [],
      });

      window.dispatchEvent(new Event("usuario-actualizado"));
      window.dispatchEvent(new Event("login-exitoso"));

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
      } else if (error.message) {
        msg = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
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

        const roles = data?.parUsuario?.roles || ["Comprador"];
        const permisos = data?.parUsuario?.permisos || [];

        localStorage.setItem("roles", JSON.stringify(roles));
        localStorage.setItem("permisos", JSON.stringify(permisos));

        setUsuario({
          nombreUsuario: nombre,
          fotoUrl,
          roles,
          permisos,
        });

        window.dispatchEvent(new Event("usuario-actualizado"));
        window.dispatchEvent(new Event("login-exitoso"));

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 py-3 backdrop-blur-sm">
      <div className="relative isolate w-[92%] max-w-md overflow-hidden rounded-[28px] border border-yellow-400/15 bg-[#15171d] px-6 pb-6 pt-7 text-white shadow-[0_22px_80px_rgba(0,0,0,0.65)]">
        {/* Luz superior suave */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-yellow-400/10 via-yellow-400/[0.04] to-transparent" />

        {/* Brillo detrás del logo */}
        <div className="pointer-events-none absolute left-1/2 top-11 h-24 w-56 -translate-x-1/2 rounded-full bg-yellow-400/[0.08] blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="relative mb-5 flex flex-col items-center text-center">
          {/* Logo integrado al fondo */}
          <div className="relative mb-2 flex h-[58px] w-full items-center justify-center overflow-visible sm:h-[74px]">
            <img
              src={LOGO_TUVENDEDOR}
              alt="TuVendedor"
              className="h-auto w-[158px] object-contain mix-blend-lighten drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:w-[198px]"
            />
          </div>

          <div className="mt-1 flex flex-col items-center gap-2">
            <h2 className="text-[21px] font-black leading-none tracking-tight text-white sm:text-[24px]">
              Iniciar sesión
            </h2>

            <span className="h-1 w-12 rounded-full bg-yellow-400/90" />
          </div>
        </div>

        <div className="relative flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-white">
              Correo o usuario
            </label>

            <input
              type="text"
              autoComplete="username"
              name="usuarioLogin"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white px-4 py-2.5 text-black shadow-sm outline-none transition focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-white">
              Contraseña
            </label>

            <input
              type="password"
              autoComplete="current-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white px-4 py-2.5 text-black shadow-sm outline-none transition focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <button
            onClick={handleLogin}
            className="mt-1 rounded-xl bg-yellow-400 py-2.5 font-black text-black shadow-lg shadow-yellow-400/10 transition hover:bg-yellow-300"
          >
            INICIAR SESIÓN
          </button>

          <div className="my-3 flex items-center">
            <hr className="flex-grow border-t border-gray-700" />
            <span className="mx-3 text-xs text-gray-400">o ingresá con</span>
            <hr className="flex-grow border-t border-gray-700" />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 hover:bg-gray-100"
              aria-label="Ingresar con Google"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="Google"
                className="h-6 w-6"
              />
            </button>
          </div>

          <p className="mt-2 text-center text-sm">
            ¿No tenés cuenta?{" "}
            <span
              onClick={() => {
                onClose();
                onSwitchToRegister(null);
              }}
              className="cursor-pointer font-bold text-yellow-400 hover:underline"
            >
              Registrate
            </span>
          </p>

          <p className="text-center text-sm">
            ¿Olvidaste tu contraseña?{" "}
            <span
              onClick={() => {
                onClose();
                window.dispatchEvent(new Event("abrir-recuperar"));
              }}
              className="cursor-pointer font-bold text-yellow-400 hover:underline"
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
