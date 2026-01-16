import React from "react";
import MenuIcon from "@mui/icons-material/Menu";

interface Props {
  onOpenMenu: () => void;
}

const HeaderBackoffice: React.FC<Props> = ({ onOpenMenu }) => {
  return (
    <header
      className="lg:hidden sticky top-0 z-40 flex items-center gap-3
                       h-14 px-4 bg-[#0f0f10] border-b border-yellow-500"
    >
      <button
        onClick={onOpenMenu}
        className="text-yellow-400 hover:text-yellow-300"
        aria-label="Abrir menú"
      >
        <MenuIcon />
      </button>

      <h1 className="text-yellow-400 font-bold text-sm uppercase tracking-wide">
        Panel de Administración
      </h1>
    </header>
  );
};

export default HeaderBackoffice;
