import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  ImagePlus,
  Loader2,
  Mail,
  Save,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  actualizarMiPerfilVendedor,
  obtenerMiPerfilVendedor,
} from "../../api/perfilVendedorService";
import {
  ActualizarMiPerfilVendedorRequest,
  PerfilPublicoVendedor,
} from "../../types/perfilVendedor.types";

const estadoInicial: ActualizarMiPerfilVendedorRequest = {
  nombreNegocio: "",
  slug: "",
  rubro: "",
  descripcion: "",

  whatsapp: "",
  instagramUrl: "",
  facebookUrl: "",

  correoContacto: "",
  mostrarEmail: false,

  ciudadVisible: "",

  esPerfilPublico: true,
  mostrarTelefono: true,

  fotoPerfil: null,
  banner: null,
};

const MiPerfilVendedor: React.FC = () => {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<PerfilPublicoVendedor | null>(null);
  const [form, setForm] =
    useState<ActualizarMiPerfilVendedorRequest>(estadoInicial);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [previewFotoPerfil, setPreviewFotoPerfil] = useState<string | null>(
    null,
  );
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  const cargarPerfil = async () => {
    try {
      setCargando(true);

      const data = await obtenerMiPerfilVendedor();

      setPerfil(data);

      setForm({
        nombreNegocio: data.nombreNegocio ?? "",
        slug: data.slug ?? "",
        rubro: data.rubro ?? "",
        descripcion: data.descripcion ?? "",

        whatsapp: data.whatsapp ?? "",
        instagramUrl: data.instagramUrl ?? "",
        facebookUrl: data.facebookUrl ?? "",

        correoContacto: data.correoContacto ?? data.email ?? "",
        mostrarEmail: data.mostrarEmail ?? false,

        ciudadVisible: data.ciudadVisible ?? "",

        esPerfilPublico: data.esPerfilPublico,
        mostrarTelefono: data.mostrarTelefono,

        fotoPerfil: null,
        banner: null,
      });

      setPreviewFotoPerfil(data.fotoPerfil);
      setPreviewBanner(data.bannerUrl);
    } catch (error) {
      console.error("Error al obtener mi perfil vendedor:", error);

      Swal.fire({
        title: "No se pudo cargar tu vitrina",
        text: "Verificá que tu usuario tenga un perfil vendedor asociado.",
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const actualizarCampo = (
    campo: keyof ActualizarMiPerfilVendedorRequest,
    valor: string | boolean | File | null,
  ) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const manejarFotoPerfil = (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0] ?? null;

    actualizarCampo("fotoPerfil", archivo);

    if (archivo) {
      setPreviewFotoPerfil(URL.createObjectURL(archivo));
    }
  };

  const manejarBanner = (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0] ?? null;

    actualizarCampo("banner", archivo);

    if (archivo) {
      setPreviewBanner(URL.createObjectURL(archivo));
    }
  };

  const guardarPerfil = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setGuardando(true);

      const data = await actualizarMiPerfilVendedor(form);

      setPerfil(data);

      setForm((prev) => ({
        ...prev,
        fotoPerfil: null,
        banner: null,
      }));

      setPreviewFotoPerfil(data.fotoPerfil);
      setPreviewBanner(data.bannerUrl);

      Swal.fire({
        title: "¡Vitrina actualizada!",
        text: "Los cambios de tu perfil público fueron guardados correctamente.",
        icon: "success",
        confirmButtonColor: "#facc15",
      });
    } catch (error: any) {
      console.error("Error al actualizar perfil vendedor:", error);

      const mensaje =
        error?.response?.data?.Errors?.[0] ||
        error?.response?.data?.Message ||
        "No se pudo actualizar el perfil vendedor.";

      Swal.fire({
        title: "No se pudo guardar",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setGuardando(false);
    }
  };

  const irPerfilPublico = () => {
    if (form.slug) {
      navigate(`/vendedor/${form.slug}`);
      return;
    }

    Swal.fire({
      title: "Falta el slug",
      text: "Para ver el perfil público primero necesitás tener un slug configurado.",
      icon: "info",
      confirmButtonColor: "#facc15",
    });
  };

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="animate-spin" />
          Cargando vitrina pública...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          <ArrowLeft size={18} />
          Volver al marketplace
        </button>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-2xl">
          <div className="relative min-h-[260px] border-b border-white/10">
            {previewBanner ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(${previewBanner})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-gray-900" />

            <div className="relative z-10 flex min-h-[260px] flex-col justify-between p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-yellow-300">
                    Perfil público del vendedor
                  </p>

                  <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
                    Mi vitrina pública
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm text-gray-200">
                    Editá cómo se ve tu perfil comercial para los visitantes:
                    portada, foto, biografía, redes, WhatsApp, correo y
                    visibilidad.
                  </p>
                </div>

                <button
                  onClick={irPerfilPublico}
                  type="button"
                  className="hidden items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300 md:flex"
                >
                  <Eye size={18} />
                  Ver perfil público
                </button>
              </div>

              <div className="flex items-end gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/70 bg-black shadow-xl">
                  {previewFotoPerfil ? (
                    <img
                      src={previewFotoPerfil}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserRound className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold">
                    {form.nombreNegocio || perfil?.nombreUsuario || "Vendedor"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-300">
                    {form.rubro || "Rubro no configurado"} ·{" "}
                    {form.ciudadVisible || "Ciudad no configurada"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {perfil?.esPremium && (
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                        Premium
                      </span>
                    )}

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        form.esPerfilPublico
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {form.esPerfilPublico
                        ? "Perfil visible"
                        : "Perfil oculto"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        form.mostrarEmail
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {form.mostrarEmail ? "Correo visible" : "Correo oculto"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={guardarPerfil}
            className="grid gap-6 p-6 lg:grid-cols-3"
          >
            <section className="space-y-5 lg:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <h3 className="mb-4 text-lg font-bold text-yellow-300">
                  Datos comerciales
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Nombre comercial
                    </label>
                    <input
                      value={form.nombreNegocio}
                      onChange={(e) =>
                        actualizarCampo("nombreNegocio", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      placeholder="Ej: Angela Cáceres KW"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Slug público
                    </label>
                    <input
                      value={form.slug}
                      onChange={(e) => actualizarCampo("slug", e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      placeholder="angelacaceres"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL: /vendedor/{form.slug || "tu-slug"}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Rubro
                    </label>
                    <input
                      value={form.rubro}
                      onChange={(e) => actualizarCampo("rubro", e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      placeholder="Inmuebles, Motos, Tecnología..."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Ciudad visible
                    </label>
                    <input
                      value={form.ciudadVisible}
                      onChange={(e) =>
                        actualizarCampo("ciudadVisible", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      placeholder="Asunción - Central"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm text-gray-300">
                    Biografía / descripción
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      actualizarCampo("descripcion", e.target.value)
                    }
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                    placeholder="Contá brevemente qué ofrecés..."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <h3 className="mb-4 text-lg font-bold text-yellow-300">
                  Contacto y redes
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      WhatsApp
                    </label>
                    <input
                      value={form.whatsapp}
                      onChange={(e) =>
                        actualizarCampo("whatsapp", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      placeholder="595981000000"
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm text-gray-300">
                      <Mail size={15} />
                      Correo de contacto
                    </label>
                    <input
                      value={form.correoContacto}
                      onChange={(e) =>
                        actualizarCampo("correoContacto", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      placeholder="contacto@tuvendedor.com.py"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Este correo puede ser distinto al correo de inicio de
                      sesión.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Instagram
                    </label>
                    <input
                      value={form.instagramUrl}
                      onChange={(e) =>
                        actualizarCampo("instagramUrl", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Facebook
                    </label>
                    <input
                      value={form.facebookUrl}
                      onChange={(e) =>
                        actualizarCampo("facebookUrl", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-300">
                  <ImagePlus size={20} />
                  Foto y portada
                </h3>

                <label className="mb-2 block text-sm text-gray-300">
                  Foto de perfil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarFotoPerfil}
                  className="mb-4 block w-full text-sm text-gray-300 file:mr-3 file:rounded-full file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-bold file:text-black"
                />

                <label className="mb-2 block text-sm text-gray-300">
                  Banner / portada
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={manejarBanner}
                  className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-full file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-bold file:text-black"
                />

                <p className="mt-3 text-xs text-gray-500">
                  Para ahorrar espacio, el backend optimiza la imagen y la sube
                  una sola vez.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <h3 className="mb-4 text-lg font-bold text-yellow-300">
                  Visibilidad
                </h3>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-gray-950 px-4 py-3">
                  <span>
                    <b className="block">Perfil público</b>
                    <small className="text-gray-400">
                      Permite que otros vean tu vitrina.
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.esPerfilPublico}
                    onChange={(e) =>
                      actualizarCampo("esPerfilPublico", e.target.checked)
                    }
                    className="h-5 w-5 accent-yellow-400"
                  />
                </label>

                <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-gray-950 px-4 py-3">
                  <span>
                    <b className="block">Mostrar teléfono</b>
                    <small className="text-gray-400">
                      Expone tu teléfono en el perfil.
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.mostrarTelefono}
                    onChange={(e) =>
                      actualizarCampo("mostrarTelefono", e.target.checked)
                    }
                    className="h-5 w-5 accent-yellow-400"
                  />
                </label>

                <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-gray-950 px-4 py-3">
                  <span>
                    <b className="block">Mostrar correo</b>
                    <small className="text-gray-400">
                      Expone el correo comercial en el perfil.
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.mostrarEmail}
                    onChange={(e) =>
                      actualizarCampo("mostrarEmail", e.target.checked)
                    }
                    className="h-5 w-5 accent-yellow-400"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-6 py-3 font-extrabold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar cambios
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={irPerfilPublico}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-yellow-400 px-6 py-3 font-bold text-yellow-300 hover:bg-yellow-400 hover:text-black md:hidden"
              >
                <Eye size={18} />
                Ver perfil público
              </button>
            </aside>
          </form>
        </section>
      </div>
    </main>
  );
};

export default MiPerfilVendedor;
