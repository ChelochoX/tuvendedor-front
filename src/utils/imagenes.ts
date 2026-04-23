// src/utils/imagenes.ts
export const normalizarImagenes = (arr?: any[]): string[] => {
  if (!Array.isArray(arr)) return [];

  return arr
    .map((img) => {
      if (!img) return "";
      if (typeof img === "string") return img;
      return img?.mainUrl || img?.thumbUrl || img?.url || img?.Url || "";
    })
    .filter(Boolean);
};
