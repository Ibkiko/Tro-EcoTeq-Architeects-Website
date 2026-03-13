(function () {
  const base =
    (typeof window !== "undefined" && window.ASSET_BASE_URL) ||
    (window.ADMIN_META && window.ADMIN_META.assetBaseUrl) ||
    (window.ADMIN_CONFIG && window.ADMIN_CONFIG.assetBaseUrl) ||
    "";

  function normalize(path) {
    if (!path) return base || "";
    const cleaned = path.startsWith("/") ? path : `/${path}`;
    const prefix = base ? base.replace(/\/$/, "") : "";
    return `${prefix}${cleaned}`;
  }

  window.assetUrl = normalize;
})();
