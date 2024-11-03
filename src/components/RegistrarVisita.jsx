// src/utils/registrarVisita.js
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const visitasBasePath = import.meta.env.VITE_VISITAS_BASE_PATH || "/api/Motos";

export const registrarVisita = async (page) => {
  try {
    await axios.post(`${apiUrl}${visitasBasePath}/registrarvisita`, null, {
      params: { page },
    });
    console.log(`Visita registrada exitosamente para la página: ${page}`);
  } catch (error) {
    console.error("Error al registrar la visita:", error);
  }
};
