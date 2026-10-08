const ZONA_HORARIA_PARAGUAY = "America/Asuncion";

/**
 * SQL Server guarda los timestamps operativos en UTC, pero las columnas
 * actuales son datetime/datetime2 y ASP.NET los serializa sin sufijo Z.
 * El navegador interpreta una fecha sin zona como hora local y por eso
 * 17:19 UTC terminaba mostrándose como 17:19 en Paraguay en vez de 14:19.
 *
 * Esta función marca como UTC únicamente timestamps generados por el servidor.
 * No debe usarse para campos de agenda ingresados manualmente por el usuario
 * (por ejemplo FechaProximoContacto), porque esos valores representan hora local.
 */
export const parsearFechaUtcServidor = (
  fecha?: string | null,
): Date | null => {
  if (!fecha) {
    return null;
  }

  const valor = fecha.trim();

  if (!valor) {
    return null;
  }

  const tieneZona = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(valor);
  const normalizada = tieneZona ? valor : `${valor}Z`;
  const resultado = new Date(normalizada);

  return Number.isNaN(resultado.getTime()) ? null : resultado;
};

export const formatearFechaHoraServidorParaguay = (
  fecha?: string | null,
  incluirAnho = true,
) => {
  const valor = parsearFechaUtcServidor(fecha);

  if (!valor) {
    return "—";
  }

  return valor.toLocaleString("es-PY", {
    timeZone: ZONA_HORARIA_PARAGUAY,
    day: "2-digit",
    month: "2-digit",
    ...(incluirAnho ? { year: "numeric" as const } : {}),
    hour: "2-digit",
    minute: "2-digit",
  });
};

const claveDiaParaguay = (fecha: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA_PARAGUAY,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);

export const esFechaServidorDeHoyEnParaguay = (
  fecha?: string | null,
) => {
  const valor = parsearFechaUtcServidor(fecha);

  if (!valor) {
    return false;
  }

  return claveDiaParaguay(valor) === claveDiaParaguay(new Date());
};

export const fechaUtcServidorEnMilisegundos = (
  fecha?: string | null,
) => parsearFechaUtcServidor(fecha)?.getTime() ?? 0;
