// Copy this file to config.js and fill in your real values.
// If your API requires auth, store the raw token in localStorage under AUTH_TOKEN_KEY.
(function () {
  const CONFIG = {
    API_URL: "https://tri-ecoteq-api.vercel.app/api",
    ADMIN_EMAIL: "admin@tri-ecoteq.com",
    STORAGE_URL: "https://cdn.tri-ecoteq.com",
    AUTH_TOKEN_KEY: "tri_ecoteq_admin_token"
  };

  const storedToken = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY) || "";
  const normalizedToken =
    storedToken && storedToken.startsWith("Bearer ")
      ? storedToken
      : storedToken
        ? `Bearer ${storedToken}`
        : "";

  window.ADMIN_CONFIG = {
    apiBaseUrl: CONFIG.API_URL,
    authToken: normalizedToken
  };

  window.ADMIN_META = {
    adminEmail: CONFIG.ADMIN_EMAIL,
    storageUrl: CONFIG.STORAGE_URL,
    tokenKey: CONFIG.AUTH_TOKEN_KEY
  };
})();
