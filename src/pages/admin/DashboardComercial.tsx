import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Download,
  Eye,
  Heart,
  LineChart,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Printer,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import { obtenerDashboardComercial } from "../../api/comercialDashboardService";

import { useUsuario } from "../../context/UsuarioContext";

import type {
  ComercialDashboard,
  ComercialDashboardSerieDiaria,
  MetricaGraficoComercial,
} from "../../types/comercialDashboard";

interface TarjetaResumenProps {
  titulo: string;
  valor: string;
  ayuda: string;
  icono: ReactNode;
  destacado?: boolean;
}

interface FilaInfoProps {
  label: string;
  value: string;
}

interface BotonPeriodoProps {
  activo: boolean;
  texto: string;
  onClick: () => void;
}

interface GraficoActividadProps {
  serie: ComercialDashboardSerieDiaria[];
  metrica: MetricaGraficoComercial;
  onCambiarMetrica: (metrica: MetricaGraficoComercial) => void;
}

const METRICAS_GRAFICO: Array<{
  key: MetricaGraficoComercial;
  label: string;
  descripcion: string;
}> = [
  {
    key: "vistasPublicaciones",
    label: "Vistas de publicaciones",
    descripcion: "Detalle de publicaciones abiertas",
  },
  {
    key: "clicksWhatsappPublicaciones",
    label: "WhatsApp publicaciones",
    descripcion: "Clicks hacia contacto de publicaciones",
  },
  {
    key: "impresionesBanners",
    label: "Impresiones banners",
    descripcion: "Visualizaciones de campañas",
  },
  {
    key: "clicksBanners",
    label: "Clicks banners",
    descripcion: "Clicks en campañas publicitarias",
  },
  {
    key: "solicitudesVisita",
    label: "Solicitudes internas",
    descripcion: "Consultas enviadas desde formularios internos",
  },
];

const obtenerRolesGuardados = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem("roles") || "[]");
  } catch {
    return [];
  }
};

function obtenerFechaLocalInput(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function sumarDias(fecha: Date, dias: number): Date {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);

  return nuevaFecha;
}

function normalizarFechaInput(valor?: string | null): string {
  if (!valor) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  return obtenerFechaLocalInput(fecha);
}

function crearRangoInicial() {
  const hasta = new Date();
  const desde = sumarDias(hasta, -27);

  return {
    fechaDesde: obtenerFechaLocalInput(desde),
    fechaHasta: obtenerFechaLocalInput(hasta),
  };
}

function formatearNumero(valor?: number | null): string {
  return Number(valor ?? 0).toLocaleString("es-PY");
}

function formatearPorcentaje(valor?: number | null): string {
  return `${Number(valor ?? 0).toLocaleString("es-PY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatearFecha(valor?: string | null): string {
  const fechaNormalizada = normalizarFechaInput(valor);

  if (!fechaNormalizada) {
    return "Sin fecha";
  }

  const [year, month, day] = fechaNormalizada.split("-");

  return `${day}/${month}/${year}`;
}

function convertirFechaTextoAInput(valor: string): string | null {
  const texto = valor.trim();

  const match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, diaRaw, mesRaw, yearRaw] = match;

  const dia = Number(diaRaw);
  const mes = Number(mesRaw);
  const year = Number(yearRaw);

  const fecha = new Date(year, mes - 1, dia);

  const fechaValida =
    fecha.getFullYear() === year &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia;

  if (!fechaValida) {
    return null;
  }

  const diaTexto = String(dia).padStart(2, "0");
  const mesTexto = String(mes).padStart(2, "0");

  return `${yearRaw}-${mesTexto}-${diaTexto}`;
}

function aplicarMascaraFecha(valor: string): string {
  const soloNumeros = valor.replace(/\D/g, "").slice(0, 8);

  if (soloNumeros.length <= 2) {
    return soloNumeros;
  }

  if (soloNumeros.length <= 4) {
    return `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`;
  }

  return `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(
    2,
    4,
  )}/${soloNumeros.slice(4)}`;
}

function obtenerClaveFecha(valor?: string | null): string {
  return normalizarFechaInput(valor);
}

function completarSerieDiaria(
  serie: ComercialDashboardSerieDiaria[],
  fechaDesde: string,
  fechaHasta: string,
): ComercialDashboardSerieDiaria[] {
  const desde = new Date(`${fechaDesde}T00:00:00`);
  const hasta = new Date(`${fechaHasta}T00:00:00`);

  if (
    Number.isNaN(desde.getTime()) ||
    Number.isNaN(hasta.getTime()) ||
    desde > hasta
  ) {
    return serie;
  }

  const mapa = new Map<string, ComercialDashboardSerieDiaria>();

  serie.forEach((item) => {
    const clave = obtenerClaveFecha(item.fecha);

    if (clave) {
      mapa.set(clave, item);
    }
  });

  const resultado: ComercialDashboardSerieDiaria[] = [];
  const cursor = new Date(desde);

  while (cursor <= hasta) {
    const clave = obtenerFechaLocalInput(cursor);
    const existente = mapa.get(clave);

    resultado.push(
      existente ?? {
        fecha: clave,
        vistasPublicaciones: 0,
        clicksWhatsappPublicaciones: 0,
        impresionesBanners: 0,
        clicksBanners: 0,
        whatsAppBanners: 0,
        solicitudesVisita: 0,
      },
    );

    cursor.setDate(cursor.getDate() + 1);
  }

  return resultado;
}

function escaparHtml(valor: string | number | null | undefined): string {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function generarTextoReporteComercial(data: ComercialDashboard): string {
  const resumen = data.resumen;

  const totalContactos =
    Number(resumen.clicksWhatsappPublicaciones ?? 0) +
    Number(resumen.whatsAppBanners ?? 0);

  return `TuVendedor Marketplace - Reporte comercial

Periodo analizado: ${formatearFecha(data.fechaDesde)} al ${formatearFecha(
    data.fechaHasta,
  )}

Resumen ejecutivo:
TuVendedor Marketplace muestra movimiento real dentro de una plataforma comercial local, con personas navegando publicaciones, revisando oportunidades y avanzando hacia canales de contacto.

Durante el período analizado se registraron ${formatearNumero(
    resumen.vistasPublicaciones,
  )} vistas de publicaciones y ${formatearNumero(
    totalContactos,
  )} acciones de contacto hacia WhatsApp.

Lectura comercial:
Estos resultados muestran que la plataforma no solamente genera exposición, sino también intención de contacto. Esto permite ofrecer a empresas, marcas y emprendedores un espacio publicitario medible, con presencia dentro de un entorno donde las personas ya están buscando productos, servicios y oportunidades.

Conclusión:
TuVendedor representa una oportunidad para negocios que desean aumentar su visibilidad local, aparecer dentro de un marketplace en crecimiento y medir el rendimiento de sus publicaciones o campañas.`;
}

function construirResumenParaCopiar(data: ComercialDashboard): string {
  return generarTextoReporteComercial(data);
}

function generarHtmlReporteComercial(data: ComercialDashboard): string {
  const resumen = data.resumen;

  const totalContactosWhatsApp =
    Number(resumen.clicksWhatsappPublicaciones ?? 0) +
    Number(resumen.whatsAppBanners ?? 0);

  const tasaContactoPublicaciones = Number(
    resumen.tasaWhatsappPublicaciones ?? 0,
  );

  const mostrarDatoBanner =
    Number(resumen.impresionesBanners ?? 0) > 0 ||
    Number(resumen.clicksBanners ?? 0) > 0 ||
    Number(resumen.whatsAppBanners ?? 0) > 0;

  const topPublicaciones = data.topPublicaciones
    .slice(0, 8)
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${escaparHtml(item.titulo)}</strong>
            <span>${escaparHtml(item.vendedor)}</span>
          </td>
          <td>${escaparHtml(item.categoria)}</td>
          <td class="numero">${formatearNumero(item.vistas)}</td>
          <td class="numero">${formatearNumero(item.clicksWhatsapp)}</td>
        </tr>
      `,
    )
    .join("");

  const topBanners = data.topBanners
    .slice(0, 8)
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${escaparHtml(item.titulo)}</strong>
            <span>${escaparHtml(item.nombreCliente)}</span>
          </td>
          <td>${escaparHtml(item.ubicacion)}</td>
          <td class="numero">${formatearNumero(item.impresiones)}</td>
          <td class="numero">${formatearNumero(item.clicks)}</td>
          <td class="numero">${formatearPorcentaje(item.ctr)}</td>
        </tr>
      `,
    )
    .join("");

  const maxVistasRubro = Math.max(
    ...data.rubros.map((item) => Number(item.vistas ?? 0)),
    1,
  );

  const rubros = data.rubros
    .slice(0, 8)
    .map((item) => {
      const tasa =
        item.vistas > 0
          ? Number(((item.clicksWhatsapp / item.vistas) * 100).toFixed(2))
          : 0;

      const anchoBarra = Math.max(
        8,
        Math.round((Number(item.vistas ?? 0) / maxVistasRubro) * 100),
      );

      return `
        <tr>
          <td>
            <strong>${escaparHtml(item.rubro)}</strong>
            <div class="bar-wrap">
              <div class="bar" style="width: ${anchoBarra}%"></div>
            </div>
          </td>
          <td class="numero">${formatearNumero(item.publicacionesActivas)}</td>
          <td class="numero">${formatearNumero(item.vistas)}</td>
          <td class="numero">${formatearNumero(item.clicksWhatsapp)}</td>
          <td class="numero">${formatearPorcentaje(tasa)}</td>
        </tr>
      `;
    })
    .join("");

  const textoBanners = mostrarDatoBanner
    ? `
      <p>
        Las campañas publicitarias ya cuentan con medición de exposición y
        rendimiento. En este período se registraron
        <strong>${formatearNumero(resumen.impresionesBanners)}</strong>
        impresiones,
        <strong>${formatearNumero(resumen.clicksBanners)}</strong>
        clicks y un CTR promedio de
        <strong>${formatearPorcentaje(resumen.ctrBanners)}</strong>.
      </p>
    `
    : `
      <p>
        Los espacios publicitarios se encuentran disponibles para campañas de
        exposición, posicionamiento de marca y derivación a canales de contacto.
        El sistema permite medir visualizaciones, clicks y rendimiento por
        campaña, generando reportes claros para cada anunciante.
      </p>
    `;

  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte comercial - TuVendedor Marketplace</title>

  <style>
    @page {
      size: A4;
      margin: 13mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #151515;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.55;
    }

    .page {
      width: 100%;
    }

    .hero {
      border-radius: 20px;
      padding: 24px;
      background:
        linear-gradient(135deg, #111827 0%, #1f2937 48%, #2d2610 100%);
      color: #ffffff;
      margin-bottom: 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .marca {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #facc15;
      margin-bottom: 8px;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      line-height: 1.08;
      color: inherit;
    }

    h2 {
      margin: 0 0 10px;
      font-size: 18px;
      color: #111827;
    }

    h3 {
      margin: 0 0 6px;
      font-size: 14px;
      color: #111827;
    }

    p {
      margin: 0 0 10px;
    }

    strong {
      color: inherit;
      font-weight: 900;
    }

    .periodo {
      margin-top: 10px;
      color: #e5e7eb;
      font-size: 13px;
    }

    .hero-text {
      margin-top: 14px;
      max-width: 92%;
      color: #f3f4f6;
      font-size: 13px;
      line-height: 1.7;
    }

    .badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 999px;
      background: #fef3c7;
      color: #92400e;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 16px 0;
    }

    .card {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 13px;
      background: #ffffff;
      box-shadow: 0 8px 18px rgba(17, 24, 39, 0.07);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .card.featured {
      border-color: #facc15;
      background: #fffbeb;
    }

    .card .label {
      display: block;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .card .value {
      display: block;
      font-size: 26px;
      line-height: 1;
      font-weight: 900;
      color: #111827;
    }

    .card .help {
      display: block;
      margin-top: 7px;
      font-size: 10.5px;
      color: #6b7280;
      line-height: 1.35;
    }

    .section {
      margin-top: 16px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      background: #ffffff;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .section-yellow {
      background: #fffbeb;
      border-color: #facc15;
    }

    .section-gray {
      background: #f9fafb;
    }

    .executive {
      display: grid;
      grid-template-columns: 1.3fr 0.7fr;
      gap: 14px;
      align-items: stretch;
    }

    .quote {
      border-radius: 16px;
      padding: 16px;
      background: #111827;
      color: #ffffff;
    }

    .quote h2 {
      color: #ffffff;
    }

    .quote p {
      color: #f3f4f6;
      line-height: 1.7;
    }

    .highlight-list {
      margin: 0;
      padding-left: 18px;
      color: #374151;
    }

    .highlight-list li {
      margin-bottom: 6px;
    }

    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }

    .explain-box {
      border-left: 4px solid #facc15;
      padding: 10px 12px;
      background: #fffbeb;
      border-radius: 10px;
      min-height: 86px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .explain-box p {
      font-size: 12px;
      color: #374151;
      margin-bottom: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 11px;
      break-inside: auto;
      page-break-inside: auto;
    }

    th {
      background: #f3f4f6;
      color: #374151;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 8px;
      border: 1px solid #e5e7eb;
    }

    td {
      padding: 8px;
      border: 1px solid #e5e7eb;
      vertical-align: top;
    }

    td span {
      display: block;
      margin-top: 2px;
      font-size: 10px;
      color: #6b7280;
    }

    .numero {
      text-align: right;
      font-weight: 900;
      white-space: nowrap;
    }

    .bar-wrap {
      width: 100%;
      height: 6px;
      margin-top: 6px;
      border-radius: 999px;
      background: #e5e7eb;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      border-radius: 999px;
      background: #facc15;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #6b7280;
    }

    @media print {
      .section,
      .card,
      .explain-box,
      .hero,
      .quote {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      thead {
        display: table-header-group;
      }

      h1,
      h2,
      h3 {
        break-after: avoid;
        page-break-after: avoid;
      }

      p {
        orphans: 3;
        widows: 3;
      }
    }
  </style>
</head>

<body>
  <main class="page">
    <header class="hero">
      <div class="marca">TuVendedor Marketplace</div>

      <h1>Reporte comercial de visibilidad digital</h1>

      <p class="periodo">
        Período analizado:
        <strong>${formatearFecha(data.fechaDesde)} al ${formatearFecha(
          data.fechaHasta,
        )}</strong>
      </p>

      <p class="hero-text">
        TuVendedor reúne publicaciones, marcas y oportunidades en un entorno
        comercial local, permitiendo que los anunciantes ganen presencia,
        visibilidad y contacto directo con potenciales clientes.
      </p>
    </header>

    <section class="executive">
      <div class="section section-yellow" style="margin-top: 0;">
        <span class="badge">Resumen ejecutivo</span>

        <p style="margin-top: 12px;">
          Durante el período analizado, la plataforma registró
          <strong>${formatearNumero(resumen.vistasPublicaciones)}</strong>
          vistas de publicaciones y
          <strong>${formatearNumero(totalContactosWhatsApp)}</strong>
          acciones de contacto hacia WhatsApp.
        </p>

        <p>
          Estos resultados muestran movimiento real dentro del marketplace:
          personas navegando publicaciones, revisando oportunidades y avanzando
          hacia canales de contacto.
        </p>

        <p>
          Para una empresa anunciante, esto representa una oportunidad de
          exposición dentro de una plataforma local con métricas claras y
          seguimiento comercial.
        </p>
      </div>

      <div class="quote">
        <h2>Lectura rápida</h2>

        <p>
          TuVendedor no ofrece solamente un espacio visual: ofrece presencia
          digital medible, con publicaciones, campañas y acciones de contacto
          que pueden evaluarse por período.
        </p>
      </div>
    </section>

    <section class="grid">
      <div class="card featured">
        <span class="label">Vistas de publicaciones</span>
        <span class="value">${formatearNumero(
          resumen.vistasPublicaciones,
        )}</span>
        <span class="help">Interés registrado dentro de la plataforma.</span>
      </div>

      <div class="card featured">
        <span class="label">Contactos a WhatsApp</span>
        <span class="value">${formatearNumero(totalContactosWhatsApp)}</span>
        <span class="help">Acciones directas hacia contacto comercial.</span>
      </div>

      <div class="card">
        <span class="label">Tasa de contacto</span>
        <span class="value">${formatearPorcentaje(
          tasaContactoPublicaciones,
        )}</span>
        <span class="help">Relación entre vistas y clicks a WhatsApp.</span>
      </div>

      <div class="card">
        <span class="label">Banners activos</span>
        <span class="value">${formatearNumero(resumen.bannersActivos)}</span>
        <span class="help">Espacios publicitarios disponibles.</span>
      </div>
    </section>

    <section class="section">
      <h2>Qué significan estos resultados</h2>

      <p>
        Los datos muestran que las publicaciones están generando visualizaciones
        y acciones de contacto. En términos comerciales, esto indica que la
        plataforma puede ayudar a una marca o negocio a aparecer frente a
        personas que ya están explorando productos, servicios y oportunidades.
      </p>

      ${textoBanners}

      <ul class="highlight-list">
        <li>Permite mostrar campañas y publicaciones en un entorno comercial.</li>
        <li>Permite medir vistas, clicks y contactos generados.</li>
        <li>Permite preparar reportes mensuales para anunciantes.</li>
      </ul>
    </section>

    <section class="section section-gray">
      <h2>Cómo interpretar las métricas</h2>

      <div class="two-columns">
        <div class="explain-box">
          <h3>Vistas de publicaciones</h3>
          <p>Indican cuántas veces las personas abrieron publicaciones. Sirven para medir interés y exposición.</p>
        </div>

        <div class="explain-box">
          <h3>Clicks a WhatsApp</h3>
          <p>Representan acciones directas hacia contacto. Es una señal de intención comercial.</p>
        </div>

        <div class="explain-box">
          <h3>Impresiones de banners</h3>
          <p>Permiten medir cuántas veces se mostró una campaña publicitaria.</p>
        </div>

        <div class="explain-box">
          <h3>CTR</h3>
          <p>Ayuda a entender qué tan atractivo fue un banner para generar clicks.</p>
        </div>
      </div>
    </section>

    <section class="section section-yellow">
      <h2>Conclusión comercial</h2>

      <p>
        TuVendedor Marketplace es una alternativa para empresas que desean
        fortalecer su presencia digital local, aparecer dentro de un espacio
        comercial activo y medir resultados de forma clara.
      </p>

      <p>
        El valor principal está en combinar visibilidad, publicaciones, banners y
        contacto directo en un solo entorno, permitiendo que cada anunciante pueda
        evaluar su exposición y evolución mes a mes.
      </p>
    </section>

    <section class="section page-break">
      <h2>Indicadores principales del período</h2>

      <table>
        <thead>
          <tr>
            <th>Indicador</th>
            <th>Resultado</th>
            <th>Lectura comercial</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td><strong>Vistas de publicaciones</strong></td>
            <td class="numero">${formatearNumero(
              resumen.vistasPublicaciones,
            )}</td>
            <td>Refleja interés y navegación dentro del marketplace.</td>
          </tr>

          <tr>
            <td><strong>Contactos hacia WhatsApp</strong></td>
            <td class="numero">${formatearNumero(totalContactosWhatsApp)}</td>
            <td>Representa acciones directas de contacto comercial.</td>
          </tr>

          <tr>
            <td><strong>Tasa de contacto</strong></td>
            <td class="numero">${formatearPorcentaje(
              tasaContactoPublicaciones,
            )}</td>
            <td>Muestra la relación entre vistas y acciones hacia WhatsApp.</td>
          </tr>

          <tr>
            <td><strong>Impresiones de banners</strong></td>
            <td class="numero">${formatearNumero(
              resumen.impresionesBanners,
            )}</td>
            <td>Mide la exposición de campañas publicitarias.</td>
          </tr>

          <tr>
            <td><strong>Clicks en banners</strong></td>
            <td class="numero">${formatearNumero(resumen.clicksBanners)}</td>
            <td>Ayuda a evaluar el interés generado por las campañas.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>Publicaciones con mayor movimiento</h2>

      <p>
        Estas publicaciones ayudan a identificar qué contenidos generan mayor
        interés dentro de la plataforma.
      </p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Publicación</th>
            <th>Rubro</th>
            <th>Vistas</th>
            <th>WA</th>
          </tr>
        </thead>
        <tbody>
          ${topPublicaciones || `<tr><td colspan="5">Sin datos disponibles.</td></tr>`}
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>Campañas publicitarias</h2>

      <p>
        Esta tabla permite visualizar el comportamiento de banners y campañas
        dentro del marketplace.
      </p>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Campaña</th>
            <th>Ubicación</th>
            <th>Impresiones</th>
            <th>Clicks</th>
            <th>CTR</th>
          </tr>
        </thead>
        <tbody>
          ${topBanners || `<tr><td colspan="6">Sin datos disponibles.</td></tr>`}
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>Rubros con mayor interés</h2>

      <p>
        Los rubros muestran qué categorías concentran mayor atención y ayudan a
        orientar futuras propuestas comerciales.
      </p>

      <table>
        <thead>
          <tr>
            <th>Rubro</th>
            <th>Publicaciones</th>
            <th>Vistas</th>
            <th>Clicks WA</th>
            <th>Tasa WA</th>
          </tr>
        </thead>
        <tbody>
          ${rubros || `<tr><td colspan="5">Sin datos disponibles.</td></tr>`}
        </tbody>
      </table>
    </section>

    <footer class="footer">
      Reporte generado con métricas internas de TuVendedor Marketplace.
      Los datos corresponden al período seleccionado en el dashboard comercial.
    </footer>
  </main>
</body>
</html>
  `;
}

function generarReporteComercialPdf(data: ComercialDashboard): void {
  const ventana = window.open("", "_blank", "width=1100,height=900");

  if (!ventana) {
    Swal.fire({
      title: "No se pudo abrir el reporte",
      text: "El navegador bloqueó la ventana emergente. Permití pop-ups para generar el PDF.",
      icon: "warning",
      confirmButtonColor: "#facc15",
    });

    return;
  }

  const html = generarHtmlReporteComercial(data);

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();

  ventana.focus();

  setTimeout(() => {
    ventana.print();
  }, 800);
}

function TarjetaResumen({
  titulo,
  valor,
  ayuda,
  icono,
  destacado = false,
}: TarjetaResumenProps) {
  return (
    <article
      className={`rounded-2xl border p-4 shadow-xl ${
        destacado
          ? "border-yellow-400/30 bg-yellow-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            {titulo}
          </p>

          <strong className="mt-3 block text-3xl font-black tracking-tight text-white md:text-4xl">
            {valor}
          </strong>
        </div>

        <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-400">
          {icono}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-400">{ayuda}</p>
    </article>
  );
}

function FilaInfo({ label, value }: FilaInfoProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <span className="text-sm text-gray-400">{label}</span>
      <strong className="text-right text-sm font-black text-white">
        {value}
      </strong>
    </div>
  );
}

function BotonPeriodo({ activo, texto, onClick }: BotonPeriodoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[42px] w-full rounded-xl px-3 py-2 text-xs font-black transition lg:w-auto ${
        activo
          ? "bg-yellow-400 text-black"
          : "border border-white/10 bg-white/5 text-gray-300 hover:border-yellow-400/40 hover:text-yellow-300"
      }`}
    >
      {texto}
    </button>
  );
}

function GraficoActividad({
  serie,
  metrica,
  onCambiarMetrica,
}: GraficoActividadProps) {
  const metricaActual = METRICAS_GRAFICO.find((item) => item.key === metrica);

  const valores = serie.map((item) => Number(item[metrica] ?? 0));
  const maximo = Math.max(...valores, 0);
  const total = valores.reduce((acumulado, valor) => acumulado + valor, 0);

  const width = 860;
  const height = 240;
  const paddingX = 32;
  const paddingY = 26;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const puntos = valores.map((valor, index) => {
    const x =
      paddingX +
      (serie.length <= 1
        ? chartWidth
        : (index / (serie.length - 1)) * chartWidth);

    const y =
      paddingY +
      chartHeight -
      (maximo <= 0 ? 0 : (valor / maximo) * chartHeight);

    return { x, y, valor };
  });

  const path = puntos
    .map((punto, index) => `${index === 0 ? "M" : "L"} ${punto.x} ${punto.y}`)
    .join(" ");

  const areaPath =
    puntos.length > 0
      ? `${path} L ${puntos[puntos.length - 1].x} ${
          height - paddingY
        } L ${puntos[0].x} ${height - paddingY} Z`
      : "";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl lg:p-5">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
            Actividad diaria
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            {metricaActual?.label ?? "Métrica"}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            {metricaActual?.descripcion ?? "Movimiento registrado por día."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {METRICAS_GRAFICO.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onCambiarMetrica(item.key)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                metrica === item.key
                  ? "bg-yellow-400 text-black"
                  : "border border-white/10 bg-black/20 text-gray-300 hover:border-yellow-400/40 hover:text-yellow-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <span className="text-xs text-gray-400">
            Total del período: {formatearNumero(total)}
          </span>

          <span className="text-xs text-gray-400">
            Pico diario: {formatearNumero(maximo)}
          </span>
        </div>

        {maximo <= 0 ? (
          <div className="grid min-h-[240px] place-items-center text-center text-sm text-gray-400">
            Todavía no hay datos para esta métrica en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto premium-scroll">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="min-w-[760px] text-yellow-400"
              role="img"
              aria-label="Gráfico de actividad diaria"
            >
              <defs>
                <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="currentColor"
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor="currentColor"
                    stopOpacity="0.02"
                  />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3].map((linea) => {
                const y = paddingY + (linea / 3) * chartHeight;

                return (
                  <line
                    key={linea}
                    x1={paddingX}
                    x2={width - paddingX}
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth="1"
                  />
                );
              })}

              <path d={areaPath} fill="url(#dashboardArea)" />

              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {serie.length <= 45 &&
                puntos.map((punto, index) => (
                  <circle
                    key={`${punto.x}-${index}`}
                    cx={punto.x}
                    cy={punto.y}
                    r="4"
                    fill="#1e1f23"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                ))}
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}

export default function DashboardComercial() {
  const navigate = useNavigate();

  const { esAdmin } = useUsuario();

  const tieneAccesoAdmin =
    esAdmin || obtenerRolesGuardados().includes("Administrador");

  const rangoInicial = useMemo(() => crearRangoInicial(), []);

  const [fechaDesde, setFechaDesde] = useState(rangoInicial.fechaDesde);
  const [fechaHasta, setFechaHasta] = useState(rangoInicial.fechaHasta);
  const [fechaDesdeTexto, setFechaDesdeTexto] = useState(
    formatearFecha(rangoInicial.fechaDesde),
  );
  const [fechaHastaTexto, setFechaHastaTexto] = useState(
    formatearFecha(rangoInicial.fechaHasta),
  );
  const [mostrarRangoPersonalizado, setMostrarRangoPersonalizado] =
    useState(false);
  const [dashboard, setDashboard] = useState<ComercialDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [metricaGrafico, setMetricaGrafico] = useState<MetricaGraficoComercial>(
    "vistasPublicaciones",
  );

  const cargarDashboard = useCallback(async () => {
    if (!tieneAccesoAdmin) {
      setCargando(false);
      return;
    }

    setCargando(true);

    try {
      const resultado = await obtenerDashboardComercial({
        fechaDesde,
        fechaHasta,
      });

      setDashboard({
        ...resultado,
        fechaDesde: normalizarFechaInput(resultado.fechaDesde) || fechaDesde,
        fechaHasta: normalizarFechaInput(resultado.fechaHasta) || fechaHasta,
      });
    } catch (error: any) {
      await Swal.fire({
        title: "No pudimos cargar el dashboard",
        text: error?.message ?? "Ocurrió un inconveniente inesperado.",
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setCargando(false);
    }
  }, [tieneAccesoAdmin, fechaDesde, fechaHasta]);

  useEffect(() => {
    void cargarDashboard();
  }, [cargarDashboard]);

  const serieCompleta = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return completarSerieDiaria(
      dashboard.serieDiaria,
      dashboard.fechaDesde || fechaDesde,
      dashboard.fechaHasta || fechaHasta,
    );
  }, [dashboard, fechaDesde, fechaHasta]);

  const fechaInicioMesActual = useMemo(() => {
    const ahora = new Date();

    return obtenerFechaLocalInput(
      new Date(ahora.getFullYear(), ahora.getMonth(), 1),
    );
  }, []);

  const fechaFinMesActual = useMemo(() => {
    const ahora = new Date();

    return obtenerFechaLocalInput(
      new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0),
    );
  }, []);

  const fechaInicioMesAnterior = useMemo(() => {
    const ahora = new Date();

    return obtenerFechaLocalInput(
      new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1),
    );
  }, []);

  const fechaFinMesAnterior = useMemo(() => {
    const ahora = new Date();

    return obtenerFechaLocalInput(
      new Date(ahora.getFullYear(), ahora.getMonth(), 0),
    );
  }, []);

  const aplicarRango = (desde: string, hasta: string) => {
    setFechaDesde(desde);
    setFechaHasta(hasta);
    setFechaDesdeTexto(formatearFecha(desde));
    setFechaHastaTexto(formatearFecha(hasta));
    setMostrarRangoPersonalizado(false);
  };

  const aplicarPeriodo = (dias: number) => {
    const hasta = new Date();
    const desde = sumarDias(hasta, -(dias - 1));

    aplicarRango(obtenerFechaLocalInput(desde), obtenerFechaLocalInput(hasta));
  };

  const aplicarMesActual = () => {
    aplicarRango(fechaInicioMesActual, fechaFinMesActual);
  };

  const aplicarMesAnterior = () => {
    aplicarRango(fechaInicioMesAnterior, fechaFinMesAnterior);
  };

  const abrirRangoPersonalizado = () => {
    setFechaDesdeTexto(formatearFecha(fechaDesde));
    setFechaHastaTexto(formatearFecha(fechaHasta));
    setMostrarRangoPersonalizado((valorActual) => !valorActual);
  };

  const aplicarRangoPersonalizado = async () => {
    const desde = convertirFechaTextoAInput(fechaDesdeTexto);
    const hasta = convertirFechaTextoAInput(fechaHastaTexto);

    if (!desde || !hasta) {
      await Swal.fire({
        title: "Fecha inválida",
        text: "Usá el formato día/mes/año. Ejemplo: 20/05/2026.",
        icon: "warning",
        confirmButtonColor: "#facc15",
      });

      return;
    }

    const desdeDate = new Date(`${desde}T00:00:00`);
    const hastaDate = new Date(`${hasta}T00:00:00`);

    if (desdeDate > hastaDate) {
      await Swal.fire({
        title: "Rango inválido",
        text: "La fecha desde no puede ser mayor que la fecha hasta.",
        icon: "warning",
        confirmButtonColor: "#facc15",
      });

      return;
    }

    aplicarRango(desde, hasta);
  };

  const periodoActualDias = useMemo(() => {
    const desde = new Date(`${fechaDesde}T00:00:00`);
    const hasta = new Date(`${fechaHasta}T00:00:00`);

    if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
      return 0;
    }

    return Math.round((hasta.getTime() - desde.getTime()) / 86400000) + 1;
  }, [fechaDesde, fechaHasta]);

  const copiarResumen = async () => {
    if (!dashboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        construirResumenParaCopiar(dashboard),
      );

      await Swal.fire({
        title: "Resumen copiado",
        text: "Ya podés pegarlo en WhatsApp, correo o un informe.",
        icon: "success",
        confirmButtonColor: "#facc15",
      });
    } catch {
      await Swal.fire({
        title: "No se pudo copiar",
        text: "Tu navegador no permitió copiar el resumen automáticamente.",
        icon: "warning",
        confirmButtonColor: "#facc15",
      });
    }
  };

  if (!tieneAccesoAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#1e1f23] px-4 text-white">
        <section className="max-w-lg rounded-2xl border border-red-400/20 bg-white/5 p-8 text-center">
          <ShieldAlert className="mx-auto text-red-300" size={42} />

          <h1 className="mt-4 text-2xl font-black">Acceso restringido</h1>

          <p className="mt-2 text-gray-400">
            Esta pantalla está disponible únicamente para administradores.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black"
          >
            Volver al marketplace
          </button>
        </section>
      </main>
    );
  }

  const resumen = dashboard?.resumen;

  return (
    <main className="min-h-screen bg-[#1e1f23] px-3 py-4 text-white sm:px-4 sm:py-6 md:px-8 print:bg-white print:text-black">
      <section className="mx-auto max-w-[1600px]">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-yellow-400 hover:text-yellow-300 print:hidden sm:text-sm"
            >
              <ArrowLeft size={16} />
              Volver al marketplace
            </button>

            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-400 sm:text-xs sm:tracking-[0.18em]">
              Tu Vendedor · Métricas comerciales
            </p>

            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl md:text-4xl">
              Dashboard comercial
            </h1>

            <p className="mt-2 max-w-3xl text-xs leading-5 text-gray-400 sm:text-sm sm:leading-6 print:text-gray-700">
              Mirá el movimiento real de publicaciones, banners, WhatsApp,
              solicitudes y rubros para preparar informes comerciales para
              gerentes, dueños de empresas y anunciantes.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:justify-end print:hidden">
            <button
              type="button"
              onClick={() => void copiarResumen()}
              disabled={!dashboard}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-400/40 px-4 py-2.5 text-sm font-black text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-50"
            >
              <Download size={18} />
              Copiar resumen
            </button>

            <button
              type="button"
              onClick={() => {
                if (dashboard) {
                  generarReporteComercialPdf(dashboard);
                }
              }}
              disabled={!dashboard}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-black text-black transition hover:bg-yellow-300 disabled:opacity-50"
            >
              <Printer size={18} />
              Imprimir / PDF
            </button>
          </div>
        </header>

        <section className="relative z-10 mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl print:border-gray-200 print:bg-white">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-400">
                <CalendarDays size={16} />
                Período analizado
              </p>

              <p className="mt-1 text-xs text-gray-400 print:text-gray-700">
                {formatearFecha(fechaDesde)} al {formatearFecha(fechaHasta)} ·{" "}
                {formatearNumero(periodoActualDias)} días
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 print:hidden sm:grid-cols-3 lg:flex lg:w-auto lg:max-w-[760px] lg:flex-wrap lg:items-center lg:justify-end">
              <BotonPeriodo
                activo={periodoActualDias === 7}
                texto="7 días"
                onClick={() => aplicarPeriodo(7)}
              />

              <BotonPeriodo
                activo={periodoActualDias === 28}
                texto="28 días"
                onClick={() => aplicarPeriodo(28)}
              />

              <BotonPeriodo
                activo={periodoActualDias === 90}
                texto="90 días"
                onClick={() => aplicarPeriodo(90)}
              />

              <BotonPeriodo
                activo={
                  fechaDesde === fechaInicioMesActual &&
                  fechaHasta === fechaFinMesActual
                }
                texto="Mes actual"
                onClick={aplicarMesActual}
              />

              <BotonPeriodo
                activo={
                  fechaDesde === fechaInicioMesAnterior &&
                  fechaHasta === fechaFinMesAnterior
                }
                texto="Mes anterior"
                onClick={aplicarMesAnterior}
              />

              <BotonPeriodo
                activo={mostrarRangoPersonalizado}
                texto="Rango personalizado"
                onClick={abrirRangoPersonalizado}
              />

              {mostrarRangoPersonalizado && (
                <div className="col-span-2 grid w-full grid-cols-1 gap-3 rounded-2xl border border-yellow-400/20 bg-black/20 p-3 sm:col-span-3 sm:grid-cols-3 lg:min-w-[560px]">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Desde
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      value={fechaDesdeTexto}
                      onChange={(event) =>
                        setFechaDesdeTexto(
                          aplicarMascaraFecha(event.target.value),
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm font-black text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Hasta
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      value={fechaHastaTexto}
                      onChange={(event) =>
                        setFechaHastaTexto(
                          aplicarMascaraFecha(event.target.value),
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm font-black text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => void aplicarRangoPersonalizado()}
                    className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 self-end rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-black text-black transition hover:bg-yellow-300"
                  >
                    <RefreshCcw size={18} />
                    Aplicar rango
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => void cargarDashboard()}
                disabled={cargando}
                className="col-span-2 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-black text-black transition hover:bg-yellow-300 disabled:opacity-60 sm:col-span-1 lg:w-auto"
              >
                <RefreshCcw
                  size={18}
                  className={cargando ? "animate-spin" : ""}
                />
                Actualizar
              </button>
            </div>
          </div>
        </section>

        {cargando ? (
          <section className="mt-6 grid min-h-[420px] place-items-center rounded-2xl border border-white/10 bg-white/5 text-yellow-400">
            <div className="text-center">
              <RefreshCcw className="mx-auto animate-spin" size={34} />
              <p className="mt-3 text-sm font-bold">Cargando métricas...</p>
            </div>
          </section>
        ) : !dashboard || !resumen ? (
          <section className="mt-6 grid min-h-[420px] place-items-center rounded-2xl border border-white/10 bg-white/5 px-4 text-center text-gray-400">
            No encontramos datos para mostrar en este período.
          </section>
        ) : (
          <>
            <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <TarjetaResumen
                titulo="Vistas publicaciones"
                valor={formatearNumero(resumen.vistasPublicaciones)}
                ayuda="Cantidad de veces que se abrieron publicaciones."
                icono={<Eye size={20} />}
                destacado
              />

              <TarjetaResumen
                titulo="Clicks WhatsApp"
                valor={formatearNumero(resumen.clicksWhatsappPublicaciones)}
                ayuda={`Tasa sobre vistas: ${formatearPorcentaje(
                  resumen.tasaWhatsappPublicaciones,
                )}`}
                icono={<MessageCircle size={20} />}
                destacado
              />

              <TarjetaResumen
                titulo="Impresiones banners"
                valor={formatearNumero(resumen.impresionesBanners)}
                ayuda="Visualizaciones registradas de campañas publicitarias."
                icono={<Megaphone size={20} />}
              />

              <TarjetaResumen
                titulo="Clicks banners"
                valor={formatearNumero(resumen.clicksBanners)}
                ayuda={`CTR promedio: ${formatearPorcentaje(resumen.ctrBanners)}`}
                icono={<MousePointerClick size={20} />}
              />
            </section>

            <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <TarjetaResumen
                titulo="Publicaciones activas"
                valor={formatearNumero(resumen.publicacionesActivas)}
                ayuda={`${formatearNumero(
                  resumen.publicacionesTotales,
                )} publicaciones totales cargadas.`}
                icono={<Store size={20} />}
              />

              <TarjetaResumen
                titulo="Vendedores"
                valor={formatearNumero(resumen.totalVendedores)}
                ayuda={`${formatearNumero(
                  resumen.totalUsuariosRegistrados,
                )} usuarios registrados en la plataforma.`}
                icono={<Users size={20} />}
              />

              <TarjetaResumen
                titulo="Solicitudes internas"
                valor={formatearNumero(resumen.solicitudesVisita)}
                ayuda="Consultas enviadas desde formularios internos."
                icono={<Sparkles size={20} />}
              />

              <TarjetaResumen
                titulo="Favoritos"
                valor={formatearNumero(resumen.favoritosActivos)}
                ayuda={`${formatearNumero(
                  resumen.publicacionesDestacadasActivas,
                )} publicaciones destacadas activas.`}
                icono={<Heart size={20} />}
              />
            </section>

            <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
              <GraficoActividad
                serie={serieCompleta}
                metrica={metricaGrafico}
                onCambiarMetrica={setMetricaGrafico}
              />

              <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl lg:p-5 print:border-gray-200 print:bg-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
                  Lectura comercial
                </p>

                <h2 className="mt-2 text-xl font-black text-white print:text-black">
                  Resumen para vender publicidad
                </h2>

                <div className="mt-4">
                  <FilaInfo
                    label="Banners activos"
                    value={formatearNumero(resumen.bannersActivos)}
                  />

                  <FilaInfo
                    label="CTR banners"
                    value={formatearPorcentaje(resumen.ctrBanners)}
                  />

                  <FilaInfo
                    label="WhatsApp desde banners"
                    value={formatearNumero(resumen.whatsAppBanners)}
                  />

                  <FilaInfo
                    label="WhatsApp desde publicaciones"
                    value={formatearNumero(resumen.clicksWhatsappPublicaciones)}
                  />

                  <FilaInfo
                    label="Tasa WhatsApp publicaciones"
                    value={formatearPorcentaje(
                      resumen.tasaWhatsappPublicaciones,
                    )}
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-50 print:border-gray-200 print:bg-gray-50 print:text-gray-800">
                  TuVendedor ya puede mostrar resultados propios: vistas,
                  clicks, contactos y rendimiento de campañas. Esto es lo que un
                  gerente o dueño necesita para evaluar si vale la pena
                  anunciar.
                </div>
              </aside>
            </section>

            <section className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl print:border-gray-200 print:bg-white">
                <header className="border-b border-white/10 px-4 py-3 print:border-gray-200">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-400">
                    <TrendingUp size={14} />
                    Top publicaciones
                  </p>

                  <h2 className="mt-1 text-lg font-black text-white print:text-black">
                    Publicaciones con más movimiento
                  </h2>
                </header>

                <div className="overflow-x-auto premium-scroll">
                  <table className="w-full min-w-[560px] table-fixed">
                    <colgroup>
                      <col />
                      <col className="w-[105px]" />
                      <col className="w-[62px]" />
                      <col className="w-[72px]" />
                      <col className="w-[70px]" />
                    </colgroup>

                    <thead className="bg-black/20 text-left text-[10px] uppercase tracking-wider text-gray-400 print:bg-gray-100 print:text-gray-600">
                      <tr>
                        <th className="px-3 py-2">Publicación</th>
                        <th className="px-2 py-2">Rubro</th>
                        <th className="px-2 py-2 text-right">Vistas</th>
                        <th className="px-2 py-2 text-right">WA</th>
                        <th className="px-2 py-2 text-right">Fav.</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10 print:divide-gray-200">
                      {dashboard.topPublicaciones.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-sm text-gray-400"
                          >
                            No hay publicaciones con datos en este período.
                          </td>
                        </tr>
                      ) : (
                        dashboard.topPublicaciones.map((item) => (
                          <tr key={item.idPublicacion} className="text-xs">
                            <td className="px-3 py-2">
                              <strong className="line-clamp-2 text-white print:text-black">
                                {item.titulo}
                              </strong>

                              <span className="mt-0.5 block truncate text-[10px] text-gray-500">
                                {item.vendedor}
                              </span>
                            </td>

                            <td className="px-2 py-2 text-[11px] text-gray-300 print:text-gray-700">
                              <span className="line-clamp-2">
                                {item.categoria}
                              </span>
                            </td>

                            <td className="px-2 py-2 text-right font-black text-white print:text-black">
                              {formatearNumero(item.vistas)}
                            </td>

                            <td className="px-2 py-2 text-right font-black text-green-300 print:text-black">
                              {formatearNumero(item.clicksWhatsapp)}
                            </td>

                            <td className="px-2 py-2 text-right font-black text-white print:text-black">
                              {formatearNumero(item.favoritos)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl print:border-gray-200 print:bg-white">
                <header className="border-b border-white/10 px-4 py-3 print:border-gray-200">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-400">
                    <BarChart3 size={14} />
                    Top banners
                  </p>

                  <h2 className="mt-1 text-lg font-black text-white print:text-black">
                    Campañas con mejor rendimiento
                  </h2>
                </header>

                <div className="overflow-x-auto premium-scroll">
                  <table className="w-full min-w-[560px] table-fixed">
                    <colgroup>
                      <col />
                      <col className="w-[92px]" />
                      <col className="w-[82px]" />
                      <col className="w-[62px]" />
                      <col className="w-[60px]" />
                    </colgroup>

                    <thead className="bg-black/20 text-left text-[10px] uppercase tracking-wider text-gray-400 print:bg-gray-100 print:text-gray-600">
                      <tr>
                        <th className="px-3 py-2">Campaña</th>
                        <th className="px-2 py-2">Ubicación</th>
                        <th className="px-2 py-2 text-right">Impres.</th>
                        <th className="px-2 py-2 text-right">Clicks</th>
                        <th className="px-2 py-2 text-right">CTR</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10 print:divide-gray-200">
                      {dashboard.topBanners.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-sm text-gray-400"
                          >
                            No hay banners con datos en este período.
                          </td>
                        </tr>
                      ) : (
                        dashboard.topBanners.map((item) => (
                          <tr key={item.idBanner} className="text-xs">
                            <td className="px-3 py-2">
                              <strong className="line-clamp-2 text-white print:text-black">
                                {item.titulo}
                              </strong>

                              <span className="mt-0.5 block truncate text-[10px] text-gray-500">
                                {item.nombreCliente} · WA:{" "}
                                {formatearNumero(item.whatsApp)}
                              </span>
                            </td>

                            <td className="px-2 py-2 text-[11px] text-gray-300 print:text-gray-700">
                              {item.ubicacion}
                            </td>

                            <td className="px-2 py-2 text-right font-black text-white print:text-black">
                              {formatearNumero(item.impresiones)}
                            </td>

                            <td className="px-2 py-2 text-right font-black text-white print:text-black">
                              {formatearNumero(item.clicks)}
                            </td>

                            <td className="px-2 py-2 text-right font-black text-yellow-300 print:text-black">
                              {formatearPorcentaje(item.ctr)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl print:border-gray-200 print:bg-white">
              <header className="border-b border-white/10 px-4 py-3 print:border-gray-200">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-400">
                  <LineChart size={14} />
                  Rubros
                </p>

                <h2 className="mt-1 text-lg font-black text-white print:text-black">
                  Rubros con mayor interés
                </h2>
              </header>

              <div className="overflow-x-auto premium-scroll">
                <table className="w-full min-w-[620px] table-fixed">
                  <colgroup>
                    <col />
                    <col className="w-[150px]" />
                    <col className="w-[90px]" />
                    <col className="w-[120px]" />
                    <col className="w-[110px]" />
                  </colgroup>

                  <thead className="bg-black/20 text-left text-[10px] uppercase tracking-wider text-gray-400 print:bg-gray-100 print:text-gray-600">
                    <tr>
                      <th className="px-3 py-2">Rubro</th>
                      <th className="px-2 py-2 text-right">Publicaciones</th>
                      <th className="px-2 py-2 text-right">Vistas</th>
                      <th className="px-2 py-2 text-right">Clicks WA</th>
                      <th className="px-2 py-2 text-right">Tasa WA</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10 print:divide-gray-200">
                    {dashboard.rubros.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm text-gray-400"
                        >
                          No hay rubros con datos en este período.
                        </td>
                      </tr>
                    ) : (
                      dashboard.rubros.map((item) => {
                        const tasa =
                          item.vistas > 0
                            ? Number(
                                (
                                  (item.clicksWhatsapp / item.vistas) *
                                  100
                                ).toFixed(2),
                              )
                            : 0;

                        return (
                          <tr key={item.rubro} className="text-xs">
                            <td className="px-3 py-2 font-black text-white print:text-black">
                              {item.rubro}
                            </td>

                            <td className="px-2 py-2 text-right text-gray-300 print:text-gray-700">
                              {formatearNumero(item.publicacionesActivas)}
                            </td>

                            <td className="px-2 py-2 text-right font-black text-white print:text-black">
                              {formatearNumero(item.vistas)}
                            </td>

                            <td className="px-2 py-2 text-right font-black text-green-300 print:text-black">
                              {formatearNumero(item.clicksWhatsapp)}
                            </td>

                            <td className="px-2 py-2 text-right font-black text-yellow-300 print:text-black">
                              {formatearPorcentaje(tasa)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
