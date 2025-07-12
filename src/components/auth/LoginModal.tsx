// src/components/auth/LoginModal.tsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase/firebase";
import { signInWithPopup } from "firebase/auth";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<Props> = ({ open, onClose }) => {
  const [login, setLogin] = useState(""); // Puede ser email o usuario
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // Aquí haces la llamada a TU BACKEND, no Firebase Auth
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login, // puede ser usuario o correo
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();
      alert("Sesión iniciada correctamente");
      console.log("Usuario:", data);
      onClose();
    } catch (error: any) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Sesión iniciada con Google");
      onClose();
    } catch (error: any) {
      alert("Error con Google: " + error.message);
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
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>
          <div>
            <label className="text-sm text-white">Contraseña</label>
            <input
              type="password"
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

            <button
              className="bg-white text-black py-2 px-4 rounded-full hover:bg-gray-100 flex items-center justify-center"
              disabled
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
                alt="Facebook"
                className="w-6 h-6"
              />
            </button>
          </div>

          <p className="text-sm text-center mt-2">
            ¿No tenés cuenta?{" "}
            <span className="text-yellow-400 cursor-pointer font-medium">
              Registrate
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
