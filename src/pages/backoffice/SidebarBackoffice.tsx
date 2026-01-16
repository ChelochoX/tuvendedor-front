import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

type NavGroup = {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
};

interface SidebarBackofficeProps {
  onNavigate?: () => void;
}

const SidebarBackoffice: React.FC<SidebarBackofficeProps> = ({
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;

  /* ===============================
     DEFINICIÓN DE MENÚ
  ================================ */
  const groups: NavGroup[] = useMemo(
    () => [
      {
        key: "clientes",
        label: "Clientes",
        icon: <PeopleIcon fontSize="small" />,
        items: [
          {
            label: "Listar clientes",
            to: "/panel/clientes/listar",
            icon: <PeopleIcon fontSize="small" />,
          },
          {
            label: "Registrar cliente",
            to: "/panel/clientes/cargar",
            icon: <PersonAddIcon fontSize="small" />,
          },
          {
            label: "Interesados",
            to: "/panel/clientes/interesados",
            icon: <PeopleIcon fontSize="small" />,
          },
        ],
      },
      {
        key: "productos",
        label: "Productos",
        icon: <StoreIcon fontSize="small" />,
        items: [
          {
            label: "Marcas",
            to: "/panel/productos/marcas",
            icon: <StoreIcon fontSize="small" />,
          },
          {
            label: "Modelos",
            to: "/panel/productos/modelos",
            icon: <CategoryIcon fontSize="small" />,
          },
          {
            label: "Precios",
            to: "/panel/productos/precios",
            icon: <LocalOfferIcon fontSize="small" />,
          },
        ],
      },
    ],
    []
  );

  /* ===============================
     ABRIR GRUPO SEGÚN RUTA
  ================================ */
  const getGroupKeyByPath = (pathname: string) => {
    if (pathname.startsWith("/panel/clientes")) return "clientes";
    if (pathname.startsWith("/panel/productos")) return "productos";
    return null;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    clientes: true,
    productos: true,
  });

  useEffect(() => {
    const key = getGroupKeyByPath(path);
    if (!key) return;
    setOpenGroups((prev) => ({ ...prev, [key]: true }));
  }, [path]);

  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  /* ===============================
     ESTILOS
  ================================ */
  const baseBtn =
    "w-full flex items-center gap-2 px-3 py-2 rounded-md transition text-left text-sm lg:text-base";
  const activeBtn = "bg-yellow-500 text-black";
  const idleBtn = "text-white hover:bg-yellow-500 hover:text-black";

  const groupHeader =
    "w-full flex items-center justify-between px-3 py-2 rounded-md transition text-left " +
    "text-yellow-300 hover:bg-yellow-500 hover:text-black";

  /* ===============================
     RENDER
  ================================ */
  return (
    <aside
      className="
        w-56 lg:w-64
        bg-[#0f0f10]
        border-r-0 lg:border-r lg:border-yellow-500
        flex flex-col
      "
    >
      {/* ================= TOP ================= */}
      <div className="p-4 space-y-3 overflow-y-auto">
        <h2 className="text-yellow-400 font-bold text-xs uppercase px-3 mt-2 mb-1">
          General
        </h2>

        {/* DASHBOARD */}
        <button
          onClick={() => {
            navigate("/panel/dashboard");
            onNavigate?.();
          }}
          className={`${baseBtn} ${
            isActive("/panel/dashboard") ? activeBtn : idleBtn
          }`}
        >
          <DashboardIcon fontSize="small" />
          <span className="font-semibold">Dashboard global</span>
        </button>

        <div className="h-px bg-yellow-500/30 my-2" />

        {/* GRUPOS */}
        {groups.map((group) => {
          const open = !!openGroups[group.key];

          return (
            <div key={group.key} className="space-y-1">
              <button
                className={groupHeader}
                onClick={() =>
                  setOpenGroups((p) => ({
                    ...p,
                    [group.key]: !p[group.key],
                  }))
                }
              >
                <span className="flex items-center gap-2 font-bold">
                  {group.icon}
                  {group.label}
                </span>

                <span
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                >
                  <ExpandMoreIcon fontSize="small" />
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pl-2 space-y-1">
                    {group.items.map((item) => (
                      <button
                        key={item.to}
                        onClick={() => {
                          navigate(item.to);
                          onNavigate?.();
                        }}
                        className={`${baseBtn} ${
                          isActive(item.to) ? activeBtn : idleBtn
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="p-4 border-t border-yellow-500/30">
        <button
          onClick={() => navigate("/")}
          className="
            w-full flex items-center justify-center gap-2
            px-3 py-2 rounded-md
            text-yellow-200 hover:text-black
            hover:bg-yellow-500
            border border-yellow-500/40
            transition
          "
          title="Volver al Marketplace"
        >
          <ArrowBackIcon fontSize="small" />
          <span className="font-semibold">Marketplace</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarBackoffice;
