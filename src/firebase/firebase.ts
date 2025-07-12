// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

// Tu configuración personalizada
const firebaseConfig = {
  apiKey: "AIzaSyAcdMPkhjA0B2U6JPCDiYatrENuuxnLPVY",
  authDomain: "tuvendedor-ecommerce.firebaseapp.com",
  projectId: "tuvendedor-ecommerce",
  storageBucket: "tuvendedor-ecommerce.firebasestorage.app",
  messagingSenderId: "426960762009",
  appId: "1:426960762009:web:5596a918163215c63cb408",
  measurementId: "G-N67WYN22J0",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar autenticación y proveedores
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };
