import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarBackoffice from "./SidebarBackoffice";
import HeaderBackoffice from "./HeaderMobile";

const LayoutBackoffice: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#0b1220]">
      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside className="hidden lg:block">
        <SidebarBackoffice onNavigate={() => setMenuOpen(false)} />
      </aside>

      {/* ===== DRAWER MOBILE ===== */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-64">
            <SidebarBackoffice onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* ===== CONTENIDO ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header solo mobile */}
        <HeaderBackoffice onOpenMenu={() => setMenuOpen(true)} />

        {/* Pages */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutBackoffice;
