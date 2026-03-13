const base = (process.env.ASSET_BASE_URL || "").replace(/\/$/, "");
const defaultLogoPath = process.env.ASSET_LOGO_PATH || "/assets/brand/tri-ecoteq-architects-logo.png";

function normalize(path = "") {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleaned}`;
}

export function assetUrl(path) {
  return normalize(path);
}

export function logoUrl() {
  return normalize(defaultLogoPath);
}

export function imageUrl(path) {
  return normalize(path);
}

export default {
  assetUrl,
  logoUrl,
  imageUrl
};
