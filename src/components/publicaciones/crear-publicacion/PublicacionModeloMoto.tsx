import React, { useEffect, useMemo, useState } from "react";
import { Bike, Hash } from "lucide-react";

import { obtenerModelos } from "../../../api/modelosProductoService";
import { ModeloProducto } from "../../../types/modeloProducto";

type Props = {
  idModeloProducto: number | null;
  onChange: (idModeloProducto: number | null) => void;
};

const esMoto = (modelo: ModeloProducto) =>
  (modelo.rubro || "").trim().toUpperCase() === "MOTO";

const PublicacionModeloMoto: React.FC<Props> = ({
  idModeloProducto,
  onChange,
}) => {
  const [modelos, setModelos] = useState<ModeloProducto[]>([]);
  const [idMarca, setIdMarca] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);

        const data = await obtenerModelos(undefined, true);
        if (cancelado) return;

        const motos = (data || [])
          .filter(esMoto)
          .sort((a, b) =>
            `${a.marca} ${a.nombreModelo}`.localeCompare(
              `${b.marca} ${b.nombreModelo}`,
              "es",
            ),
          );

        setModelos(motos);
      } catch (e: any) {
        if (cancelado) return;
        setError(e?.message || "No se pudieron cargar los modelos de motos.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    void cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!idModeloProducto || modelos.length === 0) return;

    const actual = modelos.find((m) => m.id === idModeloProducto);
    setIdMarca(actual?.idMarca ?? null);
  }, [idModeloProducto, modelos]);

  const marcas = useMemo(() => {
    const mapa = new Map<number, string>();

    modelos.forEach((modelo) => {
      mapa.set(modelo.idMarca, modelo.marca);
    });

    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [modelos]);

  const modelosMarca = useMemo(() => {
    if (!idMarca) return [];

    return modelos.filter((modelo) => modelo.idMarca === idMarca);
  }, [modelos, idMarca]);

  const seleccionado = useMemo(
    () => modelos.find((modelo) => modelo.id === idModeloProducto) ?? null,
    [modelos, idModeloProducto],
  );

  const cambiarMarca = (valor: string) => {
    const nuevoIdMarca = valor ? Number(valor) : null;
    setIdMarca(nuevoIdMarca);
    onChange(null);
  };

  const cambiarModelo = (valor: string) => {
    onChange(valor ? Number(valor) : null);
  };

  return (
    <div className="rounded-3xl border border-cyan-400/15 bg-cyan-500/[0.04] p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
          <Bike size={19} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            Modelo exacto de la moto
          </h3>
          <p className="mt-1 text-[13px] leading-5 text-gray-400">
            Este vínculo define el precio y las cuotas que Panambí informa al
            cliente. No depende del título, la descripción ni la foto.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Marca
          </span>
          <select
            value={idMarca ?? ""}
            onChange={(e) => cambiarMarca(e.target.value)}
            disabled={cargando}
            className="premium-input w-full rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60 disabled:opacity-60"
          >
            <option value="">
              {cargando ? "Cargando marcas..." : "Seleccioná la marca"}
            </option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Modelo
          </span>
          <select
            value={idModeloProducto ?? ""}
            onChange={(e) => cambiarModelo(e.target.value)}
            disabled={cargando || !idMarca}
            className="premium-input w-full rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60 disabled:opacity-60"
          >
            <option value="">
              {!idMarca ? "Primero seleccioná la marca" : "Seleccioná el modelo"}
            </option>
            {modelosMarca.map((modelo) => (
              <option key={modelo.id} value={modelo.id}>
                {modelo.nombreModelo} — {modelo.codigoReferencia}
              </option>
            ))}
          </select>
        </label>
      </div>

      {seleccionado && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-cyan-400/10 bg-black/20 px-4 py-3 text-sm text-cyan-50">
          <Hash size={15} className="shrink-0 text-cyan-300" />
          <span>
            Código empresa: <strong>{seleccionado.codigoReferencia}</strong>
            {" · "}
            {seleccionado.marca} {seleccionado.nombreModelo}
          </span>
        </div>
      )}
    </div>
  );
};

export default PublicacionModeloMoto;
