export const getPublicAppUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_APP_URL;

  if (envUrl && typeof envUrl === "string") {
    return envUrl.trim().replace(/\/$/, "");
  }

  return window.location.origin.replace(/\/$/, "");
};

export const buildVitrinaUrl = (slug?: string | null) => {
  const baseUrl = getPublicAppUrl();
  const slugLimpio = slug?.trim();

  if (!slugLimpio) return baseUrl;

  return `${baseUrl}/vendedor/${slugLimpio}`;
};

export const buildProductoUrl = (id?: number | string | null) => {
  const baseUrl = getPublicAppUrl();

  if (!id) return baseUrl;

  return `${baseUrl}/producto/${id}`;
};

export const buildProductoShareUrl = (
  id?: number | string | null,
  slug?: string | null,
) => {
  const baseUrl = getPublicAppUrl();
  const slugLimpio = slug?.trim();

  if (id) {
    return `${baseUrl}/share/producto/${encodeURIComponent(String(id))}`;
  }

  if (slugLimpio) {
    return buildVitrinaUrl(slugLimpio);
  }

  return baseUrl;
};
