export const getPublicAppUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_APP_URL;

  if (envUrl && typeof envUrl === "string") {
    return envUrl.replace(/\/$/, "");
  }

  return window.location.origin.replace(/\/$/, "");
};

export const buildVitrinaUrl = (slug: string) => {
  const baseUrl = getPublicAppUrl();
  const slugLimpio = slug?.trim();

  return `${baseUrl}/vendedor/${slugLimpio}`;
};
