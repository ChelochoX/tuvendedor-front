export const getPublicAppUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_APP_URL;

  if (envUrl && typeof envUrl === "string") {
    return envUrl.trim().replace(/\/$/, "");
  }

  return window.location.origin.replace(/\/$/, "");
};

export const getShareUrl = () => {
  const envUrl = import.meta.env.VITE_SHARE_URL;

  if (envUrl && typeof envUrl === "string") {
    return envUrl.trim().replace(/\/$/, "");
  }

  return getPublicAppUrl();
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

export const buildProductoShareUrl = (id?: number | string | null) => {
  const shareUrl = getShareUrl();

  if (!id) return getPublicAppUrl();

  return `${shareUrl}/Compartir/producto/${id}`;
};
