import React from 'react';
import Card from './Card'; // Importamos el componente Card
import { useNavigate } from 'react-router-dom';

function CardsCategorias({ modelos }) {
  const navigate = useNavigate();

  // Validamos si 'modelos' está definido y es un array para evitar errores
  if (!modelos || !Array.isArray(modelos)) {
    return <p>No hay modelos disponibles para esta categoría.</p>;
  }

  return (
    <div className="w-3/4 ml-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Modelos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modelos.map((modelo, index) => {
          // Verificamos si el modelo tiene imágenes y usamos la primera disponible
          const primeraImagen = modelo.imagenes && modelo.imagenes.length > 0
            ? modelo.imagenes[0]
            : 'https://via.placeholder.com/600x400'; // Mostrar un placeholder si no hay imágenes

          return (
            <Card
              key={index}
              image={primeraImagen} // Pasamos la primera imagen o el placeholder
              images={modelo.imagenes || []} // Pasamos todas las imágenes o un array vacío si no tiene
              title={modelo.nombre} // Solo el nombre del modelo
              link={`/motos/detalle/${modelo.nombre}`} // Redirige a la página de detalles del modelo
            />
          );
        })}
      </div>
    </div>
  );
}

export default CardsCategorias;
