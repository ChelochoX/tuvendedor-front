// src/components/BottomSheet.tsx
import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface Props {
  label?: string; // Texto en estado colapsado (ej: "Soporte")
  children: React.ReactNode;
}

const BottomSheet: React.FC<Props> = ({ label = "Soporte", children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="block md:hidden">
      {/* Pastilla colapsada o expandida */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center py-2 bg-[#222] text-yellow-400 rounded-t-xl cursor-pointer shadow-inner"
      >
        {!open ? (
          <>
            <ExpandMoreIcon className="text-yellow-400" />
            <span className="ml-1 text-sm">{label}</span>
          </>
        ) : (
          <>
            <ExpandLessIcon className="text-yellow-400" />
            <span className="ml-1 text-sm">Cerrar</span>
          </>
        )}
      </div>

      {/* Contenido deslizable */}
      <div
        className={`transition-all duration-300 overflow-hidden bg-black px-3 pb-3 ${
          open ? "max-h-60 pt-3" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
