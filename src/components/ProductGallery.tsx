import React, { useState } from "react";

interface Props {
  imagenes: string[];
}

const ProductGallery: React.FC<Props> = ({ imagenes }) => {
  const [imagenPrincipal, setImagenPrincipal] = useState(imagenes[0]);

  return (
    <div>
      <img
        src={imagenPrincipal}
        alt="Producto"
        className="w-full h-64 md:h-96 object-cover rounded-xl shadow-sm"
      />

      <div className="flex gap-2 mt-2 overflow-x-auto">
        {imagenes.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Vista ${idx + 1}`}
            onClick={() => setImagenPrincipal(img)}
            className={`w-16 h-16 md:w-20 md:h-20 rounded cursor-pointer object-cover border-2 ${
              imagenPrincipal === img
                ? "border-yellow-500"
                : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
