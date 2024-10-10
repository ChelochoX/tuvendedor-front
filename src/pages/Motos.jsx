import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // Importa Sidebar
import CardsCategorias from '../components/CardsCategorias'; // Importa CardsCategorias
import axios from 'axios'; // Usaremos Axios para hacer la petición

function Motos() {
  // Lista de categorías (agregamos "PROMOCIONES")
  const categories = [
    'ATV/CUACI',
    'CUB/Motonetas',
    'Electricas',
    'Motocargas',
    'Scooter',
    'Trail',
    'Utilitaria',
    'PROMOCIONES' // Nueva categoría agregada
  ];

  // Estado para la categoría seleccionada (por defecto es la primera categoría)
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Estado para almacenar los modelos de la categoría
  const [modelos, setModelos] = useState([]);

  // Función para obtener los modelos de la categoría seleccionada
  const fetchModelos = async (categoria) => {
    try {
      // Convertimos '/' en '-' para la categoría 'ATV/CUACI'
      const formattedCategory = categoria.replace(/\//g, '-');
      
      // Llama a la API del backend para obtener los modelos con la categoría formateada
      const response = await axios.get(`https://localhost:7040/api/motos/modelo/${formattedCategory}`);
      
      // Actualiza el estado con los modelos obtenidos
      setModelos(response.data);
    } catch (error) {
      console.error("Error al obtener los modelos:", error);
    }
  };

  // Llamar a la API cada vez que cambie la categoría seleccionada
  useEffect(() => {
    fetchModelos(selectedCategory);
  }, [selectedCategory]);

  return (
    <div>    
      <div className="container mx-auto px-4 py-8">
        <div className="flex">
          {/* Sidebar que actualizará la categoría seleccionada */}
          <Sidebar categories={categories} setCategory={setSelectedCategory} />

          {/* Grid de Motos con margen izquierdo en modo web */}
          <div className="flex-1 md:ml-64">
            <CardsCategorias modelos={modelos} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Motos;
