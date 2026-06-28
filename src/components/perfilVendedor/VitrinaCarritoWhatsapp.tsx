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
  onActualizarCantidad: (idPublicacion: number, cantidad: number) => void;
  onEliminar: (idPublicacion: number) => void;
  onVaciar: () => void;
}

const CANTIDADES_RAPIDAS = [0.25, 0.5, 0.75, 1];
const CANTIDAD_MINIMA_PEDIDO = 0.25;

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

const redondear2 = (valor: number): number => {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
};

const formatearNumeroConPuntos = (valor: number): string => {
  const valorRedondeado = redondear2(valor);
  const [parteEntera, parteDecimal] = valorRedondeado.toString().split(".");

  const enteroConPuntos = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (!parteDecimal) {
    return enteroConPuntos;
  }

  return `${enteroConPuntos}.${parteDecimal}`;
};

const formatearPrecio = (
  precio?: number | null,
  moneda?: string | null,
): string => {
  if (precio === null || precio === undefined || Number.isNaN(Number(precio))) {
    return "Consultar precio";
  }

  const valor = Number(precio);

  if (valor <= 0) {
    return "Consultar precio";
  }

  const monedaNormalizada = moneda?.trim().toUpperCase() || "PYG";
  const numeroFormateado = formatearNumeroConPuntos(valor);

  if (monedaNormalizada === "USD") {
    return `USD ${numeroFormateado}`;
  }

  return `Gs. ${numeroFormateado}`;
};

const obtenerPrecioNumerico = (precio?: number | null): number => {
  if (precio === null || precio === undefined || Number.isNaN(Number(precio))) {
    return 0;
  }

  const valor = Number(precio);

  if (valor <= 0) {
    return 0;
  }

  return valor;
};

const normalizarCantidadPedido = (cantidad: number): number => {
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return CANTIDAD_MINIMA_PEDIDO;
  }

  const cantidadRedondeada = Math.round(cantidad * 100) / 100;

  return cantidadRedondeada < CANTIDAD_MINIMA_PEDIDO
    ? CANTIDAD_MINIMA_PEDIDO
    : cantidadRedondeada;
};

const formatearCantidad = (cantidad: number): string => {
  const cantidadNormalizada = normalizarCantidadPedido(cantidad);

  if (Number.isInteger(cantidadNormalizada)) {
    return String(cantidadNormalizada);
  }

  return cantidadNormalizada.toLocaleString("es-PY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const obtenerSubtotalItem = (item: CarritoPedidoItem): number => {
  return redondear2(
    obtenerPrecioNumerico(item.publicacion.precio) * item.cantidad,
  );
};

const abrirWhatsapp = (
  telefono: string | null | undefined,
  mensaje: string,
) => {
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

  const params = new URLSearchParams();

  params.set("phone", numero);
  params.set("text", mensaje);

  const url = `https://api.whatsapp.com/send?${params.toString()}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

const VitrinaCarritoWhatsapp: React.FC<Props> = ({
  perfil,
  items,
  onIncrementar,
  onDisminuir,
  onActualizarCantidad,
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

  const totalItems = items.length;

  const totalEstimado = useMemo(
    () =>
      redondear2(
        items.reduce((acum, item) => acum + obtenerSubtotalItem(item), 0),
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
    const ICONO_PEDIDO = "\u{1F6D2}";
    const ICONO_TOTAL = "\u{1F4B0}";
    const ICONO_DELIVERY = "\u{1F6F5}";
    const ICONO_RETIRO = "\u{1F3EC}";
    const ICONO_PAGO = "\u{1F4B3}";
    const ICONO_UBICACION = "\u{1F4CD}";
    const ICONO_CHECK = "\u{2705}";

    const lineasProductos = items
      .map((item, index) => {
        const producto = item.publicacion;
        const subtotal = obtenerSubtotalItem(item);

        const subtotalTexto =
          subtotal > 0
            ? formatearPrecio(subtotal, producto.moneda)
            : "A confirmar";

        return `${index + 1}. ${producto.titulo}
   Cantidad solicitada: ${formatearCantidad(item.cantidad)}
   Precio base: ${formatearPrecio(producto.precio, producto.moneda)}
   Subtotal: ${subtotalTexto}`;
      })
      .join("\n\n");

    const textoDelivery =
      modalidad === "Delivery"
        ? `
${ICONO_DELIVERY} Datos de delivery:
Zona: ${zonaDelivery || "A coordinar"}
Costo: ${costoDelivery || "A coordinar"}
Tiempo estimado: ${tiempoDelivery || "A coordinar"}`
        : `
${ICONO_RETIRO} Modalidad:
Retiro / coordinar con el vendedor`;

    const textoUbicacion =
      ubicacionCliente && ubicacionCliente.trim()
        ? `

${ICONO_UBICACION} Ubicación / dirección del cliente:
${ubicacionCliente.trim()}`
        : "";

    return `Hola, quiero hacer este pedido desde la vitrina de ${nombreVendedor}.

${ICONO_PEDIDO} Pedido:
${lineasProductos}

${ICONO_TOTAL} Total productos: ${totalTexto}
${ICONO_TOTAL} Total a cobrar: ${totalTexto}${
      modalidad === "Delivery" && costoDelivery ? " + costo de delivery" : ""
    }

${textoDelivery}

${ICONO_PAGO} Forma de pago:
A coordinar${textoUbicacion}

${ICONO_CHECK} Favor confirmar disponibilidad y total final. Gracias.`;
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
      <style>{`
        .vitrina-carrito-scroll {
          scrollbar-width: thin;
          scrollbar-color: #facc15 #111827;
        }

        .vitrina-carrito-scroll::-webkit-scrollbar {
          width: 9px;
        }

        .vitrina-carrito-scroll::-webkit-scrollbar-track {
          background: #111827;
          border-radius: 999px;
        }

        .vitrina-carrito-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #facc15 0%, #22c55e 100%);
          border-radius: 999px;
          border: 2px solid #111827;
        }

        .vitrina-carrito-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #fde047 0%, #16a34a 100%);
        }

        .vitrina-carrito-scroll::-webkit-scrollbar-corner {
          background: #111827;
        }
      `}</style>

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

            <div className="vitrina-carrito-scroll max-h-[70vh] overflow-y-auto p-5 pr-3">
              <div className="space-y-4">
                {items.map((item) => {
                  const subtotal = obtenerSubtotalItem(item);

                  const subtotalTexto =
                    subtotal > 0
                      ? formatearPrecio(subtotal, item.publicacion.moneda)
                      : "A confirmar";

                  return (
                    <div
                      key={item.publicacion.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black sm:h-24 sm:w-24">
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
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-black sm:text-base">
                                {item.publicacion.titulo}
                              </p>

                              <p className="mt-1 text-lg font-extrabold text-yellow-300 sm:text-xl">
                                {formatearPrecio(
                                  item.publicacion.precio,
                                  item.publicacion.moneda,
                                )}
                              </p>

                              <p className="mt-1 text-xs font-medium text-gray-400">
                                Precio base x cantidad solicitada
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onEliminar(item.publicacion.id)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300 transition hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                                Cantidad
                              </span>

                              <span className="text-sm font-extrabold text-yellow-300">
                                Subtotal: {subtotalTexto}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onDisminuir(item.publicacion.id)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-yellow-400 hover:text-black"
                              >
                                <Minus size={15} />
                              </button>

                              <input
                                type="number"
                                min={CANTIDAD_MINIMA_PEDIDO}
                                step="0.25"
                                value={item.cantidad}
                                onChange={(event) => {
                                  const valor = Number(event.target.value);

                                  onActualizarCantidad(
                                    item.publicacion.id,
                                    valor,
                                  );
                                }}
                                onBlur={(event) => {
                                  const valor = Number(event.target.value);

                                  onActualizarCantidad(
                                    item.publicacion.id,
                                    valor,
                                  );
                                }}
                                className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-center text-sm font-black text-white outline-none transition focus:border-yellow-400"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  onIncrementar(item.publicacion.id)
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-yellow-400 hover:text-black"
                              >
                                <Plus size={15} />
                              </button>
                            </div>

                            <div className="mt-2 grid grid-cols-4 gap-1.5">
                              {CANTIDADES_RAPIDAS.map((cantidad) => (
                                <button
                                  key={cantidad}
                                  type="button"
                                  onClick={() =>
                                    onActualizarCantidad(
                                      item.publicacion.id,
                                      cantidad,
                                    )
                                  }
                                  className={`rounded-xl px-2 py-2 text-[11px] font-black transition ${
                                    item.cantidad === cantidad
                                      ? "bg-yellow-400 text-black"
                                      : "bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] hover:text-white"
                                  }`}
                                >
                                  {formatearCantidad(cantidad)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.07] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                  Total estimado
                </p>

                <p className="mt-1 text-3xl font-black">{totalTexto}</p>
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
