export const getPublicAppUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_APP_URL;

  if (envUrl && typeof envUrl === "string") {
    return envUrl.replace(/\/$/, "");
  }

  return window.location.origin.replace(/\/$/, "");
};

export const getShareUrl = () => {
  const envUrl = import.meta.env.VITE_SHARE_URL;

  if (envUrl && typeof envUrl === "string") {
    return envUrl.replace(/\/$/, "");
  }

  return getPublicAppUrl();
};

export const buildVitrinaUrl = (slug: string) => {
  const baseUrl = getPublicAppUrl();
  const slugLimpio = slug?.trim();

  return `${baseUrl}/vendedor/${slugLimpio}`;
};

export const buildProductoUrl = (id: number | string) => {
  const baseUrl = getPublicAppUrl();

  return `${baseUrl}/producto/${id}`;
};

export const buildProductoShareUrl = (id: number | string) => {
  const shareUrl = getShareUrl();

  return `${shareUrl}/Compartir/producto/${id}`;
};
