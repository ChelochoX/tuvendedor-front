import React, { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Minus,
  Navigation,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  PerfilPublicoVendedor,
  PublicacionPerfilVendedor,
} from "../../types/perfilVendedor.types";

export interface CarritoPedidoItem {
  publicacion: PublicacionPerfilVendedor;
  cantidad: number;
}

interface Props {
  perfil: PerfilPublicoVendedor;
  items: CarritoPedidoItem[];
  onIncrementar: (idPublicacion: number) => void;
  onDisminuir: (idPublicacion: number) => void;
  onEliminar: (idPublicacion: number) => void;
  onVaciar: () => void;
}

const limpiarTelefonoWhatsapp = (telefono?: string | null): string => {
  if (!telefono) return "";

  let numero = telefono.replace(/\D/g, "");

  if (numero.startsWith("0")) {
    numero = `595${numero.slice(1)}`;
  }

  if (!numero.startsWith("595")) {
    numero = `595${numero}`;
  }

  return numero;
};

const formatearPrecio = (
  precio?: number | null,
  moneda?: string | null,
): string => {
  if (!precio || precio <= 0) return "Consultar precio";

  const monedaNormalizada = moneda?.trim().toUpperCase() || "PYG";

  if (monedaNormalizada === "USD") {
    return `USD ${Number(precio).toLocaleString("es-PY", {
      maximumFractionDigits: 0,
    })}`;
  }

  return `Gs. ${Number(precio).toLocaleString("es-PY", {
    maximumFractionDigits: 0,
  })}`;
};

const obtenerPrecioNumerico = (precio?: number | null): number => {
  if (!precio || precio <= 0) return 0;
  return Number(precio);
};

const abrirWhatsapp = (telefono: string | undefined, mensaje: string) => {
  const numero = limpiarTelefonoWhatsapp(telefono);

  if (!numero) {
    Swal.fire({
      icon: "info",
      title: "WhatsApp no disponible",
      text: "El vendedor todavía no configuró un número de WhatsApp.",
      confirmButtonColor: "#facc15",
      background: "#111827",
      color: "#ffffff",
    });
    return;
  }

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

const VitrinaCarritoWhatsapp: React.FC<Props> = ({
  perfil,
  items,
  onIncrementar,
  onDisminuir,
  onEliminar,
  onVaciar,
}) => {
  const [abierto, setAbierto] = useState(false);
  const [modoEntrega, setModoEntrega] = useState<"retiro" | "delivery">(
    "retiro",
  );
  const [direccionManual, setDireccionManual] = useState("");
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  useEffect(() => {
    if (!items.length && abierto) {
      setAbierto(false);
    }
  }, [items.length, abierto]);

  const totalItems = useMemo(
    () => items.reduce((acum, item) => acum + item.cantidad, 0),
    [items],
  );

  const totalEstimado = useMemo(
    () =>
      items.reduce(
        (acum, item) =>
          acum + obtenerPrecioNumerico(item.publicacion.precio) * item.cantidad,
        0,
      ),
    [items],
  );

  const moneda = items[0]?.publicacion.moneda || "PYG";

  const totalTexto =
    totalEstimado > 0
      ? formatearPrecio(totalEstimado, moneda)
      : "Total a confirmar";

  const nombreVendedor =
    perfil.nombreNegocio?.trim() || perfil.nombreUsuario?.trim() || "Vendedor";

  const zonaDelivery = perfil.zonaDelivery ?? perfil.ZonaDelivery ?? "";
  const costoDelivery = perfil.costoDelivery ?? perfil.CostoDelivery ?? "";
  const tiempoDelivery =
    perfil.tiempoEstimadoDelivery ?? perfil.TiempoEstimadoDelivery ?? "";

  const construirMensajeBase = (
    modalidad: "Retiro / coordinar" | "Delivery",
    ubicacionCliente?: string,
  ) => {
    const lineasProductos = items
      .map((item, index) => {
        const producto = item.publicacion;

        return `${index + 1}. ${producto.titulo}
   Cantidad: ${item.cantidad}
   Precio unitario: ${formatearPrecio(producto.precio, producto.moneda)}`;
      })
      .join("\n\n");

    const textoDelivery =
      modalidad === "Delivery"
        ? `
🚚 Datos de delivery:
${zonaDelivery ? `Zona: ${zonaDelivery}` : "Zona: A coordinar"}
${costoDelivery ? `Costo: ${costoDelivery}` : "Costo: A coordinar"}
${tiempoDelivery ? `Tiempo estimado: ${tiempoDelivery}` : "Tiempo estimado: A coordinar"}`
        : `
🏬 Modalidad:
Retiro / coordinar con el vendedor`;

    return `Hola, quiero hacer este pedido desde la vitrina de ${nombreVendedor}.

🛒 Pedido:
${lineasProductos}

💰 Total productos: ${totalTexto}
💵 Total a cobrar: ${totalTexto}${modalidad === "Delivery" && costoDelivery ? " + costo de delivery" : ""}

${textoDelivery}

💳 Forma de pago: A coordinar
${ubicacionCliente ? `\n📍 Ubicación / dirección del cliente:\n${ubicacionCliente}` : ""}

Por favor confirmame disponibilidad y el total final.`;
  };

  const enviarPedidoRetiro = () => {
    const mensaje = construirMensajeBase("Retiro / coordinar");
    abrirWhatsapp(perfil.whatsapp, mensaje);
  };

  const enviarPedidoDeliveryManual = () => {
    if (!direccionManual.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta la dirección",
        text: "Escribí la dirección o referencia de entrega para enviar el pedido.",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#ffffff",
      });
      return;
    }

    const mensaje = construirMensajeBase("Delivery", direccionManual.trim());
    abrirWhatsapp(perfil.whatsapp, mensaje);
  };

  const enviarPedidoDeliveryConUbicacion = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "info",
        title: "Ubicación no disponible",
        text: "Tu navegador no permite obtener ubicación. Escribí tu dirección manualmente.",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#ffffff",
      });
      return;
    }

    setObteniendoUbicacion(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setObteniendoUbicacion(false);

        const { latitude, longitude } = position.coords;
        const linkMapa = `https://www.google.com/maps?q=${latitude},${longitude}`;

        const mensaje = construirMensajeBase("Delivery", linkMapa);
        abrirWhatsapp(perfil.whatsapp, mensaje);
      },
      () => {
        setObteniendoUbicacion(false);

        Swal.fire({
          icon: "info",
          title: "No pudimos obtener tu ubicación",
          text: "Puede ser que hayas rechazado el permiso. Podés escribir tu dirección manualmente.",
          confirmButtonColor: "#facc15",
          background: "#111827",
          color: "#ffffff",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  if (!items.length) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="fixed bottom-4 left-1/2 z-[9990] flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-yellow-400/40 bg-[#101722]/95 px-4 py-3 text-white shadow-2xl shadow-black/40 backdrop-blur-md transition hover:border-yellow-400 sm:bottom-6"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-black">
            <ShoppingCart size={21} />
          </span>

          <span className="text-left">
            <span className="block text-sm font-black">
              {totalItems} producto{totalItems === 1 ? "" : "s"} en pedido
            </span>
            <span className="block text-xs font-bold text-yellow-300">
              {totalTexto}
            </span>
          </span>
        </span>

        <span className="rounded-xl bg-green-500 px-3 py-2 text-xs font-black text-white">
          Ver pedido
        </span>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-[#101722] text-white shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                  Pedido por WhatsApp
                </p>
                <h3 className="mt-1 text-xl font-black">Tu pedido</h3>
              </div>

              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.publicacion.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black">
                        {item.publicacion.thumbUrl ||
                        item.publicacion.imagenPrincipal ? (
                          <img
                            src={
                              item.publicacion.thumbUrl ||
                              item.publicacion.imagenPrincipal
                            }
                            alt={item.publicacion.titulo}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                            Sin foto
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-black">
                          {item.publicacion.titulo}
                        </p>

                        <p className="mt-1 text-xs font-bold text-yellow-300">
                          {formatearPrecio(
                            item.publicacion.precio,
                            item.publicacion.moneda,
                          )}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onDisminuir(item.publicacion.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-yellow-400 hover:text-black"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-8 text-center text-sm font-black">
                              {item.cantidad}
                            </span>

                            <button
                              type="button"
                              onClick={() => onIncrementar(item.publicacion.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-yellow-400 hover:text-black"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onEliminar(item.publicacion.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-300 transition hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.07] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                  Total estimado
                </p>
                <p className="mt-1 text-2xl font-black">{totalTexto}</p>
                <p className="mt-2 text-xs leading-5 text-gray-400">
                  El vendedor confirma disponibilidad, envío y horario.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                <button
                  type="button"
                  onClick={() => setModoEntrega("retiro")}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black transition ${
                    modoEntrega === "retiro"
                      ? "bg-yellow-400 text-black"
                      : "text-gray-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <Store size={16} />
                  Retiro
                </button>

                <button
                  type="button"
                  onClick={() => setModoEntrega("delivery")}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black transition ${
                    modoEntrega === "delivery"
                      ? "bg-green-500 text-white"
                      : "text-gray-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="text-base leading-none">🛵</span>
                  Delivery
                </button>
              </div>

              {modoEntrega === "delivery" && (
                <div className="mt-4 rounded-2xl border border-green-400/20 bg-green-500/10 p-4">
                  <p className="text-sm font-black text-white">
                    ¿Dónde querés recibir el pedido?
                  </p>

                  <button
                    type="button"
                    onClick={enviarPedidoDeliveryConUbicacion}
                    disabled={obteniendoUbicacion}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-black text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Navigation size={17} />
                    {obteniendoUbicacion
                      ? "Obteniendo ubicación..."
                      : "Enviar mi ubicación actual"}
                  </button>

                  <textarea
                    value={direccionManual}
                    onChange={(event) => setDireccionManual(event.target.value)}
                    rows={3}
                    placeholder="O escribí tu dirección / referencia de entrega..."
                    className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
                  />

                  <button
                    type="button"
                    onClick={enviarPedidoDeliveryManual}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                  >
                    <MessageCircle size={17} />
                    Enviar pedido con dirección
                  </button>
                </div>
              )}

              {modoEntrega === "retiro" && (
                <button
                  type="button"
                  onClick={enviarPedidoRetiro}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                >
                  <MessageCircle size={17} />
                  Enviar pedido por WhatsApp
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAbierto(false);
                  onVaciar();
                }}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black text-gray-300 transition hover:bg-red-500/15 hover:text-red-200"
              >
                Vaciar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VitrinaCarritoWhatsapp;
