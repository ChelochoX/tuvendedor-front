import React from "react";

export const obtenerUrlMediaVitrina = (media: any): string => {
  if (!media) return "";
  if (typeof media === "string") return media;

  return (
    media.mainUrl ||
    media.url ||
    media.Url ||
    media.secure_url ||
    media.thumbUrl ||
    media.thumbnailUrl ||
    ""
  );
};

export const obtenerThumbMediaVitrina = (media: any): string => {
  if (!media) return "";
  if (typeof media === "string") return media;

  return (
    media.thumbUrl ||
    media.thumbnailUrl ||
    media.mainUrl ||
    media.url ||
    media.Url ||
    media.secure_url ||
    ""
  );
};

export const esVideoMediaVitrina = (media: any): boolean => {
  const url = obtenerUrlMediaVitrina(media);
  const thumb = obtenerThumbMediaVitrina(media);

  const revisar = (valor?: string) => {
    if (!valor) return false;

    const limpia = valor.split("?")[0].toLowerCase();

    return (
      limpia.includes("/video/upload/") ||
      /\.(mp4|mov|webm|avi|mkv)$/i.test(limpia)
    );
  };

  return revisar(url) || revisar(thumb);
};

export const obtenerPosterVideoVitrina = (media: any): string => {
  const url = obtenerUrlMediaVitrina(media);
  const thumb = obtenerThumbMediaVitrina(media);

  if (thumb && !esVideoMediaVitrina(thumb)) {
    return thumb;
  }

  if (!url || !esVideoMediaVitrina(url)) {
    return "";
  }

  const urlSinQuery = url.split("?")[0];

  if (urlSinQuery.includes("/video/upload/")) {
    return urlSinQuery
      .replace(
        "/video/upload/",
        "/video/upload/so_0,w_900,h_650,c_fill,q_auto,f_jpg/",
      )
      .replace(/\.(mp4|mov|webm|avi|mkv)$/i, ".jpg");
  }

  return "";
};

interface VitrinaMediaProps {
  media: any;
  alt?: string;
  className?: string;
  objectFit?: "cover" | "contain";
  controls?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  showVideoBadge?: boolean;
  showPlayIcon?: boolean;
}

const VitrinaMedia: React.FC<VitrinaMediaProps> = ({
  media,
  alt = "Publicación",
  className = "h-full w-full",
  objectFit = "cover",
  controls = false,
  muted = true,
  autoPlay = false,
  loop = false,
  showVideoBadge = true,
  showPlayIcon = true,
}) => {
  const url = obtenerUrlMediaVitrina(media);
  const thumb = obtenerThumbMediaVitrina(media);
  const esVideo = esVideoMediaVitrina(media);
  const poster = obtenerPosterVideoVitrina(media);

  if (!url && !thumb) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#020617] text-xs font-bold text-white/50`}
      >
        Sin imagen
      </div>
    );
  }

  if (esVideo) {
    const videoSrc = url || thumb;

    return (
      <div className={`relative overflow-hidden bg-black ${className}`}>
        {poster && !controls ? (
          <img
            src={poster}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full"
            style={{ objectFit }}
          />
        ) : (
          <video
            src={videoSrc}
            poster={poster || undefined}
            controls={controls}
            muted={muted}
            autoPlay={autoPlay}
            loop={loop}
            playsInline
            preload="metadata"
            className="h-full w-full"
            style={{ objectFit }}
          />
        )}

        {showVideoBadge && (
          <span className="absolute left-2 top-2 rounded-full border border-yellow-400/70 bg-black/75 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-yellow-300 shadow-lg backdrop-blur">
            ▶ Video
          </span>
        )}

        {showPlayIcon && !controls && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-400/80 bg-black/70 pl-0.5 text-sm font-black text-yellow-300 shadow-xl">
              ▶
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={thumb || url}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      style={{ objectFit }}
    />
  );
};

export default VitrinaMedia;