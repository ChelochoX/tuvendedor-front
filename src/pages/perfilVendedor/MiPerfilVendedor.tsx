import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ArrowLeft, ImagePlus, Mail, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  obtenerMiPerfilVendedor,
  actualizarMiPerfilVendedor,
} from "../../api/perfilVendedorService";

import HerramientasPremiumVitrina from "../../components/perfilVendedor/HerramientasPremiumVitrina";

import GestionPublicacionesVitrina from "./GestionPublicacionesVitrina";
interface MiPerfilVendedorForm {
  idVendedor?: number;
  idUsuario?: number;
  slug: string;
  nombreNegocio: string;
  nombreUsuario?: string;
  descripcion: string;
  bannerUrl?: string;
  fotoPerfil?: string;
  rubro: string;
  ciudadVisible: string;
  telefono?: string;
  whatsapp: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
  esPerfilPublico: boolean;
  esPremium: boolean;
  mostrarTelefono: boolean;
  mostrarCorreo: boolean;
}

const estadoInicial: MiPerfilVendedorForm = {
  slug: "",
  nombreNegocio: "",
  nombreUsuario: "",
  descripcion: "",
  bannerUrl: "",
  fotoPerfil: "",
  rubro: "",
  ciudadVisible: "",
  telefono: "",
  whatsapp: "",
  email: "",
  instagramUrl: "",
  facebookUrl: "",
  esPerfilPublico: true,
  esPremium: false,
  mostrarTelefono: true,
  mostrarCorreo: true,
};

const MiPerfilVendedor: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<MiPerfilVendedorForm>(estadoInicial);
  const [fotoPerfilArchivo, setFotoPerfilArchivo] = useState<File | null>(null);
  const [bannerArchivo, setBannerArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const fotoPreview = useMemo(() => {
    if (fotoPerfilArchivo) return URL.createObjectURL(fotoPerfilArchivo);
    return form.fotoPerfil || "";
  }, [fotoPerfilArchivo, form.fotoPerfil]);

  const bannerPreview = useMemo(() => {
    if (bannerArchivo) return URL.createObjectURL(bannerArchivo);
    return (
      form.bannerUrl ||
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
    );
  }, [bannerArchivo, form.bannerUrl]);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setCargando(true);

      const data = await obtenerMiPerfilVendedor();

      setForm({
        idVendedor: data.idVendedor,
        idUsuario: data.idUsuario,
        slug: data.slug || "",
        nombreNegocio: data.nombreNegocio || "",
        nombreUsuario: data.nombreUsuario || "",
        descripcion: data.descripcion || "",
        bannerUrl: data.bannerUrl || "",
        fotoPerfil: data.fotoPerfil || "",
        rubro: data.rubro || "",
        ciudadVisible: data.ciudadVisible || "",
        telefono: data.telefono || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        instagramUrl: data.instagramUrl || "",
        facebookUrl: data.facebookUrl || "",
        esPerfilPublico: data.esPerfilPublico ?? true,
        esPremium: data.esPremium ?? false,
        mostrarTelefono: data.mostrarTelefono ?? true,
        mostrarCorreo: data.mostrarCorreo ?? true,
      });
    } catch (error: any) {
      console.error("Error al cargar perfil vendedor:", error);

      Swal.fire({
        title: "No se pudo cargar tu vitrina",
        text:
          error?.response?.data?.Message ||
          error?.message ||
          "Ocurrió un error al obtener los datos del perfil.",
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setCargando(false);
    }
  };

  const actualizarCampo = <K extends keyof MiPerfilVendedorForm>(
    campo: K,
    valor: MiPerfilVendedorForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const normalizarSlug = (valor: string) => {
    return valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSlugChange = (valor: string) => {
    actualizarCampo("slug", normalizarSlug(valor));
  };

  const handleFotoPerfilChange = (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    setFotoPerfilArchivo(archivo);
  };

  const handleBannerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    setBannerArchivo(archivo);
  };

  const validar = () => {
    if (!form.nombreNegocio.trim()) {
      return "Ingresá el nombre comercial de tu vitrina.";
    }

    if (!form.slug.trim()) {
      return "Ingresá el slug público de tu vitrina.";
    }

    if (!form.rubro.trim()) {
      return "Ingresá el rubro principal.";
    }

    if (!form.descripcion.trim()) {
      return "Ingresá una biografía o descripción comercial.";
    }

    return null;
  };

  const handleGuardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validar();

    if (error) {
      Swal.fire({
        title: "Faltan datos",
        text: error,
        icon: "warning",
        confirmButtonColor: "#facc15",
      });

      return;
    }

    try {
      setGuardando(true);

      const formData = new FormData();

      formData.append("NombreNegocio", form.nombreNegocio);
      formData.append("Slug", form.slug);
      formData.append("Rubro", form.rubro);
      formData.append("CiudadVisible", form.ciudadVisible);
      formData.append("Descripcion", form.descripcion);
      formData.append("Whatsapp", form.whatsapp);
      formData.append("Email", form.email);
      formData.append("InstagramUrl", form.instagramUrl);
      formData.append("FacebookUrl", form.facebookUrl);
      formData.append("EsPerfilPublico", String(form.esPerfilPublico));
      formData.append("MostrarTelefono", String(form.mostrarTelefono));
      formData.append("MostrarCorreo", String(form.mostrarCorreo));

      if (fotoPerfilArchivo) {
        formData.append("FotoPerfil", fotoPerfilArchivo);
      }

      if (bannerArchivo) {
        formData.append("Banner", bannerArchivo);
      }

      await actualizarMiPerfilVendedor(formData);

      Swal.fire({
        title: "Vitrina actualizada",
        text: "Los cambios se guardaron correctamente.",
        icon: "success",
        confirmButtonColor: "#facc15",
      });

      setFotoPerfilArchivo(null);
      setBannerArchivo(null);

      await cargarPerfil();
    } catch (error: any) {
      console.error("Error al guardar perfil vendedor:", error);

      Swal.fire({
        title: "No se pudo guardar",
        text:
          error?.response?.data?.Errors?.[0] ||
          error?.response?.data?.Message ||
          error?.message ||
          "Ocurrió un error al actualizar la vitrina.",
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center shadow-xl">
          <p className="text-sm font-bold text-yellow-300">
            Cargando tu vitrina...
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Estamos preparando tu panel premium.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-bold text-white transition hover:bg-yellow-400 hover:text-black"
        >
          <ArrowLeft size={17} />
          Volver al marketplace
        </button>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#101722] shadow-2xl">
          <div
            className="relative min-h-[255px] bg-cover bg-center"
            style={{
              backgroundImage: `url(${bannerPreview})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-[#101722]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/50" />

            <div className="relative z-10 flex min-h-[255px] flex-col justify-between p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-yellow-300">
                    Perfil público del vendedor
                  </p>

                  <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
                    Mi vitrina pública
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-100">
                    Editá cómo se ve tu perfil comercial para los visitantes:
                    portada, foto, biografía, redes, WhatsApp, correo y
                    visibilidad.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="h-24 w-24 overflow-hidden rounded-3xl border border-white/50 bg-gray-900 shadow-xl sm:h-28 sm:w-28">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt={form.nombreNegocio}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-800 text-xs text-gray-400">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="pb-1">
                  <h2 className="text-2xl font-black">
                    {form.nombreNegocio || "Nombre comercial"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-200">
                    {form.rubro || "Rubro"} ·{" "}
                    {form.ciudadVisible || "Ciudad visible"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.esPremium && (
                      <span className="rounded-full bg-yellow-400 px-4 py-1 text-xs font-black text-black">
                        Premium
                      </span>
                    )}

                    {form.esPerfilPublico && (
                      <span className="rounded-full bg-green-500/25 px-4 py-1 text-xs font-black text-green-200">
                        Perfil visible
                      </span>
                    )}

                    {form.mostrarCorreo && (
                      <span className="rounded-full bg-blue-500/25 px-4 py-1 text-xs font-black text-blue-200">
                        Correo visible
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-5 sm:p-7">
            {form.slug && (
              <div className="mb-6">
                <HerramientasPremiumVitrina
                  slug={form.slug}
                  rubro={form.rubro}
                  nombreNegocio={form.nombreNegocio}
                  descripcion={form.descripcion}
                  ciudadVisible={form.ciudadVisible}
                  onPublicacionCreada={() => {
                    Swal.fire({
                      title: "Producto agregado",
                      text: "Ya podés verlo en tu vitrina pública.",
                      icon: "success",
                      confirmButtonColor: "#facc15",
                    });
                  }}
                />
              </div>
            )}

            <form
              onSubmit={handleGuardar}
              className="grid gap-6 lg:grid-cols-[1fr_360px]"
            >
              <div className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-xl font-black text-yellow-300">
                    Datos comerciales
                  </h3>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Nombre comercial
                      </label>
                      <input
                        value={form.nombreNegocio}
                        onChange={(e) =>
                          actualizarCampo("nombreNegocio", e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Slug público
                      </label>
                      <input
                        value={form.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        URL: /vendedor/{form.slug || "mi-vitrina"}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Rubro
                      </label>
                      <input
                        value={form.rubro}
                        onChange={(e) =>
                          actualizarCampo("rubro", e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Ciudad visible
                      </label>
                      <input
                        value={form.ciudadVisible}
                        onChange={(e) =>
                          actualizarCampo("ciudadVisible", e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Biografía / descripción
                      </label>
                      <textarea
                        value={form.descripcion}
                        onChange={(e) =>
                          actualizarCampo("descripcion", e.target.value)
                        }
                        rows={4}
                        className="w-full resize-none rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-xl font-black text-yellow-300">
                    Contacto y redes
                  </h3>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        WhatsApp
                      </label>
                      <input
                        value={form.whatsapp}
                        onChange={(e) =>
                          actualizarCampo("whatsapp", e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
                        <Mail size={15} />
                        Correo de contacto
                      </label>
                      <input
                        value={form.email}
                        onChange={(e) =>
                          actualizarCampo("email", e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Este correo puede ser distinto al correo de inicio de
                        sesión.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Instagram
                      </label>
                      <input
                        value={form.instagramUrl}
                        onChange={(e) =>
                          actualizarCampo("instagramUrl", e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Facebook
                      </label>
                      <input
                        value={form.facebookUrl}
                        onChange={(e) =>
                          actualizarCampo("facebookUrl", e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70"
                      />
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="flex items-center gap-2 text-xl font-black text-yellow-300">
                    <ImagePlus size={20} />
                    Foto y portada
                  </h3>

                  <div className="mt-5 space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Foto de perfil
                      </label>

                      <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-black transition hover:bg-yellow-300">
                        Elegir archivo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFotoPerfilChange}
                        />
                      </label>

                      <span className="ml-3 text-xs text-gray-400">
                        {fotoPerfilArchivo?.name || "No se seleccionó archivo"}
                      </span>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-200">
                        Banner / portada
                      </label>

                      <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-black transition hover:bg-yellow-300">
                        Elegir archivo
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleBannerChange}
                        />
                      </label>

                      <span className="ml-3 text-xs text-gray-400">
                        {bannerArchivo?.name || "No se seleccionó archivo"}
                      </span>

                      <p className="mt-3 text-xs leading-relaxed text-gray-500">
                        Para ahorrar espacio, el backend optimiza la imagen y la
                        sube una sola vez.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-xl font-black text-yellow-300">
                    Visibilidad
                  </h3>

                  <div className="mt-5 space-y-3">
                    <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#070b13] px-4 py-3">
                      <div>
                        <p className="font-black text-white">Perfil público</p>
                        <p className="text-xs text-gray-400">
                          Permite que otros vean tu vitrina.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={form.esPerfilPublico}
                        onChange={(e) =>
                          actualizarCampo("esPerfilPublico", e.target.checked)
                        }
                        className="h-5 w-5 accent-yellow-400"
                      />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#070b13] px-4 py-3">
                      <div>
                        <p className="font-black text-white">
                          Mostrar teléfono
                        </p>
                        <p className="text-xs text-gray-400">
                          Expone tu teléfono en el perfil.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={form.mostrarTelefono}
                        onChange={(e) =>
                          actualizarCampo("mostrarTelefono", e.target.checked)
                        }
                        className="h-5 w-5 accent-yellow-400"
                      />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#070b13] px-4 py-3">
                      <div>
                        <p className="font-black text-white">Mostrar correo</p>
                        <p className="text-xs text-gray-400">
                          Expone el correo comercial en el perfil.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={form.mostrarCorreo}
                        onChange={(e) =>
                          actualizarCampo("mostrarCorreo", e.target.checked)
                        }
                        className="h-5 w-5 accent-yellow-400"
                      />
                    </label>
                  </div>
                </section>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-6 py-4 text-base font-black text-black shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </aside>
            </form>
          </div>
        </section>
        <GestionPublicacionesVitrina />
      </div>
    </div>
  );
};

export default MiPerfilVendedor;
