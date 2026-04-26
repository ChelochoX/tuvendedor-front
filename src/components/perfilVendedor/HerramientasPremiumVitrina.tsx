import React, { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  ExternalLink,
  Gem,
  LayoutGrid,
  MessageCircle,
  PlusCircle,
  Search,
  Share2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import CrearPublicacionModal from "../publicaciones/CrearPublicacionModal";
import { buildProductoShareUrl, buildVitrinaUrl } from "../../config/appConfig";
import { obtenerPerfilPublicoVendedor } from "../../api/perfilVendedorService";

interface Props {
  slug: string;
  rubro?: string;
  nombreNegocio?: string;
  descripcion?: string;
  ciudadVisible?: string;
  onPublicacionCreada?: () => void;
}

interface PublicacionCampania {
  id: number;
  titulo: string;
  descripcion?: string;
  precio?: number;
  moneda?: "PYG" | "USD" | string | null;
  categoria?: string;
  ubicacion?: string;
  imagenPrincipal?: string;
  thumbUrl?: string;
  estado?: string;
  esDestacada?: boolean;
}

type ModalActivo = "compartir" | "campania" | "vista" | null;

const HerramientasPremiumVitrina: React.FC<Props> = ({
  slug,
  rubro,
  nombreNegocio,
  descripcion,
  ciudadVisible,
  onPublicacionCreada,
}) => {
  const [modalPublicacionAbierto, setModalPublicacionAbierto] = useState(false);
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);
  const [plantillaSeleccionada, setPlantillaSeleccionada] =
    useState("producto");

  const [publicaciones, setPublicaciones] = useState<PublicacionCampania[]>([]);
  const [publicacionSeleccionada, setPublicacionSeleccionada] =
    useState<PublicacionCampania | null>(null);
  const [cargandoPublicaciones, setCargandoPublicaciones] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mensajeEditable, setMensajeEditable] = useState("");

  const slugSeguro = slug?.trim();
  const urlVitrina = useMemo(() => buildVitrinaUrl(slugSeguro), [slugSeguro]);

  const nombre = nombreNegocio?.trim() || "Mi vitrina";
  const rubroTexto = rubro?.trim() || "productos";
  const ciudad = ciudadVisible?.trim();

  const validarSlug = () => {
    if (slugSeguro) return true;

    Swal.fire({
      title: "Falta el slug",
      text: "Primero guardá el slug público de tu vitrina.",
      icon: "warning",
      confirmButtonColor: "#facc15",
    });

    return false;
  };

  const abrirPerfilPublico = () => {
    if (!validarSlug()) return;
    window.location.href = `/vendedor/${slugSeguro}`;
  };

  const copiarTexto = async (
    texto: string,
    titulo = "Copiado",
    mensaje = "El contenido se copió correctamente.",
  ) => {
    try {
      await navigator.clipboard.writeText(texto);

      Swal.fire({
        title: titulo,
        text: mensaje,
        icon: "success",
        confirmButtonColor: "#facc15",
      });
    } catch {
      Swal.fire({
        title: "No se pudo copiar automáticamente",
        text: texto,
        icon: "info",
        confirmButtonColor: "#facc15",
      });
    }
  };

  const abrirWhatsAppConTexto = (texto: string) => {
    const mensaje = encodeURIComponent(texto);

    window.open(
      `https://wa.me/?text=${mensaje}`,
      "_blank",
      "noopener,noreferrer",
    );
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

  const urlProducto = (id?: number) => {
    if (!id) return urlVitrina;

    return buildProductoShareUrl(id, slugSeguro);
  };

  const cargarPublicaciones = async () => {
    if (!validarSlug()) return;

    try {
      setCargandoPublicaciones(true);

      const perfil = await obtenerPerfilPublicoVendedor(slugSeguro);

      const items = (perfil.publicaciones || []) as PublicacionCampania[];

      setPublicaciones(items);

      if (items.length > 0) {
        setPublicacionSeleccionada((actual) => actual || items[0]);
      }
    } catch (error) {
      console.error("Error al cargar publicaciones para campaña:", error);

      Swal.fire({
        title: "No se pudieron cargar las publicaciones",
        text: "Intentá nuevamente en unos segundos.",
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setCargandoPublicaciones(false);
    }
  };

  const abrirCampania = async () => {
    setModalActivo("campania");

    if (publicaciones.length === 0) {
      await cargarPublicaciones();
    }
  };

  useEffect(() => {
    if (modalActivo === "campania" && publicaciones.length === 0) {
      cargarPublicaciones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalActivo]);

  const publicacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return publicaciones;

    return publicaciones.filter((item) => {
      return (
        item.titulo?.toLowerCase().includes(texto) ||
        item.categoria?.toLowerCase().includes(texto) ||
        item.ubicacion?.toLowerCase().includes(texto)
      );
    });
  }, [busqueda, publicaciones]);

  const mensajeCompartirVitrina = useMemo(() => {
    return `Hola 👋

Te comparto mi vitrina en Tu Vendedor:

${nombre}
${ciudad ? `📍 ${ciudad}` : ""}
${rubroTexto ? `🏷️ ${rubroTexto}` : ""}

Podés ver mi catálogo completo acá:
${urlVitrina}`;
  }, [nombre, ciudad, rubroTexto, urlVitrina]);

  const mensajesCampania = useMemo(() => {
    if (!publicacionSeleccionada) {
      return {
        producto: `Seleccioná una publicación para generar una campaña.`,
        corto: `Seleccioná una publicación para generar una campaña.`,
        estado: `Seleccioná una publicación para generar una campaña.`,
        formal: `Seleccioná una publicación para generar una campaña.`,
      };
    }

    const producto = publicacionSeleccionada;
    const precio = formatearPrecio(producto.precio, producto.moneda);
    const link = urlProducto(producto.id);

    const descripcionProducto =
      producto.descripcion?.trim() ||
      "Producto disponible en mi vitrina de Tu Vendedor.";

    return {
      producto: `Hola 👋

Te comparto esta publicación disponible:

🏷️ ${producto.titulo}
${producto.categoria ? `📌 ${producto.categoria}` : ""}
${producto.ubicacion ? `📍 ${producto.ubicacion}` : ""}
💰 ${precio}

${descripcionProducto}

Ver publicación:
${link}`,

      corto: `Hola 👋 Te comparto esta publicación:

${producto.titulo}
💰 ${precio}

${link}`,

      estado: `🔥 Disponible ahora

${producto.titulo}
${producto.ubicacion ? `📍 ${producto.ubicacion}` : ""}
💰 ${precio}

Consultá acá:
${link}`,

      formal: `Hola, ¿cómo estás?

Te comparto esta publicación que puede interesarte:

${producto.titulo}
${producto.categoria ? `Categoría: ${producto.categoria}` : ""}
${producto.ubicacion ? `Ubicación: ${producto.ubicacion}` : ""}
Precio: ${precio}

${descripcionProducto}

Podés ver más detalles en el siguiente enlace:
${link}

Quedo atento/a a cualquier consulta.`,
    };
  }, [publicacionSeleccionada, slugSeguro, urlVitrina]);

  const mensajeActual =
    mensajesCampania[plantillaSeleccionada as keyof typeof mensajesCampania];

  useEffect(() => {
    setMensajeEditable(mensajeActual);
  }, [mensajeActual]);

  const imagenProducto =
    publicacionSeleccionada?.imagenPrincipal ||
    publicacionSeleccionada?.thumbUrl ||
    "";

  const compartirCampaniaConImagen = async () => {
    if (!publicacionSeleccionada) {
      Swal.fire({
        title: "Seleccioná una publicación",
        text: "Primero elegí qué producto querés compartir.",
        icon: "warning",
        confirmButtonColor: "#facc15",
      });

      return;
    }

    const textoFinal = mensajeEditable.trim() || mensajeActual;

    if (!imagenProducto) {
      abrirWhatsAppConTexto(textoFinal);
      return;
    }

    try {
      const response = await fetch(imagenProducto, {
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("No se pudo descargar la imagen.");
      }

      const blob = await response.blob();
      const tipo = blob.type || "image/jpeg";

      const extension = tipo.includes("png")
        ? "png"
        : tipo.includes("webp")
          ? "webp"
          : "jpg";

      const archivo = new File(
        [blob],
        `publicacion-${publicacionSeleccionada.id}.${extension}`,
        {
          type: tipo,
        },
      );

      const data: ShareData = {
        title: publicacionSeleccionada.titulo,
        text: textoFinal,
        files: [archivo],
      };

      if (navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
        return;
      }

      await copiarTexto(
        textoFinal,
        "Campaña copiada",
        "Tu navegador no permite compartir imagen desde la web. Copiamos el texto para que lo pegues en WhatsApp.",
      );
    } catch (error) {
      console.error("Error al compartir campaña con imagen:", error);

      await copiarTexto(
        textoFinal,
        "Campaña copiada",
        "No se pudo adjuntar la imagen automáticamente. Copiamos el texto para que lo pegues en WhatsApp.",
      );
    }
  };

  const copiarEnlacePreview = async () => {
    if (!publicacionSeleccionada) {
      Swal.fire({
        title: "Seleccioná una publicación",
        text: "Primero elegí qué producto querés compartir.",
        icon: "warning",
        confirmButtonColor: "#facc15",
      });
      return;
    }

    await copiarTexto(
      urlProducto(publicacionSeleccionada.id),
      "Enlace copiado",
      "Este enlace permite que WhatsApp muestre la vista previa con imagen.",
    );
  };

  return (
    <>
      <section className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 via-white/[0.03] to-black/20 p-5 shadow-xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-300">
              <Gem size={14} />
              Herramientas premium
            </div>

            <h2 className="mt-3 text-2xl font-black text-white">
              Gestioná tu catálogo profesional
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
              Cargá productos, compartí tu vitrina, generá campañas por
              publicación y controlá cómo ven tus clientes tu catálogo.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirPerfilPublico}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-5 py-3 text-sm font-black text-black shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300"
          >
            <ExternalLink size={17} />
            Ver perfil público
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <button
            type="button"
            onClick={() => setModalPublicacionAbierto(true)}
            className="group rounded-3xl border border-yellow-400/30 bg-yellow-400 px-4 py-5 text-left text-black shadow-lg transition hover:-translate-y-1 hover:bg-yellow-300"
          >
            <PlusCircle size={25} />
            <h3 className="mt-3 font-black">Agregar producto</h3>
            <p className="mt-1 text-xs font-semibold text-black/70">
              Cargá una publicación guiada para tu vitrina.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              copiarTexto(
                mensajeCompartirVitrina,
                "Mensaje copiado",
                "Ahora podés compartir tu vitrina completa.",
              )
            }
            className="group rounded-3xl border border-white/10 bg-black/25 px-4 py-5 text-left text-white transition hover:-translate-y-1 hover:border-yellow-400/50 hover:bg-yellow-400/10"
          >
            <Share2 className="text-yellow-300" size={25} />
            <h3 className="mt-3 font-black">Compartir vitrina</h3>
            <p className="mt-1 text-xs text-gray-400">
              Copiá un mensaje simple con tu catálogo completo.
            </p>
          </button>

          <button
            type="button"
            onClick={abrirCampania}
            className="group rounded-3xl border border-green-400/20 bg-green-500/10 px-4 py-5 text-left text-white transition hover:-translate-y-1 hover:bg-green-500/20"
          >
            <MessageCircle className="text-green-300" size={25} />
            <h3 className="mt-3 font-black">Crear campaña WhatsApp</h3>
            <p className="mt-1 text-xs text-gray-400">
              Elegí una publicación y generá un mensaje de venta.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModalActivo("vista")}
            className="group rounded-3xl border border-white/10 bg-black/25 px-4 py-5 text-left text-white transition hover:-translate-y-1 hover:border-yellow-400/50 hover:bg-yellow-400/10"
          >
            <LayoutGrid className="text-yellow-300" size={25} />
            <h3 className="mt-3 font-black">Vista inteligente</h3>
            <p className="mt-1 text-xs text-gray-400">
              Controlá cómo se presenta tu catálogo público.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-yellow-200">
              <Sparkles size={13} />
              Premium activo
            </div>
          </button>
        </div>
      </section>

      <CrearPublicacionModal
        abierto={modalPublicacionAbierto}
        onClose={() => setModalPublicacionAbierto(false)}
        onCreado={() => {
          setModalPublicacionAbierto(false);
          onPublicacionCreada?.();
          cargarPublicaciones();
        }}
        modo="perfil-vendedor"
        rubroVendedor={rubro}
      />

      {modalActivo === "campania" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101722] p-5 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-green-300">
                  Campaña WhatsApp
                </p>

                <h3 className="mt-1 text-2xl font-black">
                  Compartí una publicación
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Elegí un producto de tu vitrina, ajustá el mensaje y envialo
                  cuando esté listo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalActivo(null)}
                className="rounded-full bg-white/10 p-2 text-gray-300 hover:bg-red-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <aside className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar publicación..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>

                {cargandoPublicaciones ? (
                  <div className="rounded-2xl bg-white/[0.04] p-4 text-sm text-gray-400">
                    Cargando publicaciones...
                  </div>
                ) : publicacionesFiltradas.length === 0 ? (
                  <div className="rounded-2xl bg-white/[0.04] p-4 text-sm text-gray-400">
                    No encontramos publicaciones para compartir.
                  </div>
                ) : (
                  <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                    {publicacionesFiltradas.map((item) => {
                      const activa = item.id === publicacionSeleccionada?.id;
                      const imagen = item.thumbUrl || item.imagenPrincipal;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPublicacionSeleccionada(item)}
                          className={`flex w-full gap-3 rounded-2xl border p-2 text-left transition ${
                            activa
                              ? "border-yellow-400 bg-yellow-400/10"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                          }`}
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-800">
                            {imagen ? (
                              <img
                                src={imagen}
                                alt={item.titulo}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                                Sin foto
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-white">
                              {item.titulo}
                            </p>
                            <p className="mt-1 truncate text-xs text-gray-400">
                              {item.ubicacion ||
                                item.categoria ||
                                "Sin ubicación"}
                            </p>
                            <p className="mt-1 text-xs font-black text-yellow-300">
                              {formatearPrecio(item.precio, item.moneda)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </aside>

              <section>
                <div className="mb-4 grid gap-2 sm:grid-cols-4">
                  {[
                    ["producto", "Producto"],
                    ["corto", "Corto"],
                    ["estado", "Estado"],
                    ["formal", "Formal"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlantillaSeleccionada(key)}
                      className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                        plantillaSeleccionada === key
                          ? "bg-yellow-400 text-black"
                          : "bg-white/[0.05] text-white hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        Mensaje editable
                      </p>

                      <button
                        type="button"
                        onClick={() => setMensajeEditable(mensajeActual)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-gray-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Restaurar plantilla
                      </button>
                    </div>

                    <textarea
                      value={mensajeEditable}
                      onChange={(e) => setMensajeEditable(e.target.value)}
                      rows={15}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-gray-100 outline-none transition focus:border-yellow-400/70 focus:bg-black/40"
                      placeholder="Escribí o personalizá tu mensaje..."
                    />

                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      Podés modificar el texto antes de copiarlo o enviarlo por
                      WhatsApp. El enlace de la publicación se mantiene dentro
                      del mensaje.
                    </p>
                  </div>

                  <aside className="space-y-3">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                      {imagenProducto ? (
                        <img
                          src={imagenProducto}
                          alt={publicacionSeleccionada?.titulo || nombre}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-black/40 text-xs text-gray-500">
                          Sin imagen seleccionada
                        </div>
                      )}

                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-300">
                          Imagen de la publicación
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                          WhatsApp mostrará esta imagen como vista previa cuando
                          el enlace público esté disponible en producción.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copiarTexto(
                          mensajeEditable.trim() || mensajeActual,
                          "Campaña copiada",
                          "Pegala en WhatsApp, estados o redes sociales.",
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 font-black text-yellow-200 transition hover:bg-yellow-400 hover:text-black"
                    >
                      <Copy size={18} />
                      Copiar campaña
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        abrirWhatsAppConTexto(
                          mensajeEditable.trim() || mensajeActual,
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-green-400/30 bg-green-500/15 px-4 py-3 font-black text-green-200 transition hover:bg-green-500 hover:text-white"
                    >
                      <MessageCircle size={18} />
                      Abrir en WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={copiarEnlacePreview}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-500/15 px-4 py-3 font-black text-blue-100 transition hover:bg-blue-500 hover:text-white"
                    >
                      <Share2 size={18} />
                      Copiar enlace con preview
                    </button>
                  </aside>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {modalActivo === "vista" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#101722] p-5 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-yellow-300">
                  Vista inteligente
                </p>

                <h3 className="mt-1 text-2xl font-black">
                  Control premium del catálogo
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Esta sección será el centro para controlar cómo se ve tu
                  vitrina pública.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalActivo(null)}
                className="rounded-full bg-white/10 p-2 text-gray-300 hover:bg-red-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  "Orden personalizado",
                  "Elegir qué productos aparecen primero.",
                ],
                ["Destacados premium", "Promocionar productos clave."],
                [
                  "Categorías visibles",
                  "Mostrar solo las categorías que vendés.",
                ],
                [
                  "Ocultar vendidos",
                  "Limpiar automáticamente el catálogo público.",
                ],
              ].map(([titulo, texto]) => (
                <div
                  key={titulo}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <Wand2 className="text-yellow-300" size={20} />

                  <h4 className="mt-3 font-black">{titulo}</h4>

                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    {texto}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={abrirPerfilPublico}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 font-black text-black transition hover:bg-yellow-300"
            >
              <Eye size={18} />
              Ver cómo se ve mi vitrina
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HerramientasPremiumVitrina;
