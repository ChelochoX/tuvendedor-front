import React from "react";

const PortadaPredeterminada: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#07111f]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 18%, rgba(250, 204, 21, 0.42), transparent 30%), radial-gradient(circle at 88% 10%, rgba(59, 130, 246, 0.30), transparent 30%), linear-gradient(125deg, #172033 0%, #07111f 52%, #111827 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.10) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-yellow-300/50" />
      <div className="absolute -bottom-36 -left-28 h-80 w-80 rounded-full border border-yellow-300/25" />

      <div className="absolute right-[10%] top-[12%] h-28 w-28 rotate-45 rounded-[30px] border border-white/20 bg-white/[0.05]" />
      <div className="absolute right-[24%] top-[44%] h-16 w-16 rotate-45 rounded-2xl border border-yellow-300/35 bg-yellow-300/[0.06]" />

      <div className="absolute left-[48%] top-[12%] h-44 w-px rotate-[28deg] bg-white/15" />
      <div className="absolute left-[52%] top-[8%] h-52 w-px rotate-[28deg] bg-yellow-300/20" />
    </div>
  );
};

export default PortadaPredeterminada;