// Copy this file to config.js and fill in your real values.
// If your API requires auth, store the raw token in localStorage under AUTH_TOKEN_KEY.
(function () {
  const CONFIG = {
    API_URL: "/api",
    ADMIN_EMAIL: "admin@tri-ecoteq.com",
    STORAGE_URL: "https://cdn.tri-ecoteq.com",
    AUTH_TOKEN_KEY: "tri_ecoteq_admin_token",
    ALLOWED_ADMINS: ["josejacques98@gmail.com", "ibrahibkiko26@gmail.com"],
    LOGIN_PASSWORD: "Teq@2026",
    MAIN_SITE_URL: "https://tri-ecoteq.com",
    PORTFOLIO_URL: "https://tri-ecoteq.com/portfolio",
    BUY_PLAN_URL: "https://tri-ecoteq.com/buy-plan",
    ASSET_BASE_URL: ""
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
    authToken: normalizedToken,
    mainSiteUrl: CONFIG.MAIN_SITE_URL,
    portfolioUrl: CONFIG.PORTFOLIO_URL,
    buyPlanUrl: CONFIG.BUY_PLAN_URL,
    assetBaseUrl: CONFIG.ASSET_BASE_URL
  };

  window.ADMIN_META = {
    adminEmail: CONFIG.ADMIN_EMAIL,
    storageUrl: CONFIG.STORAGE_URL,
    tokenKey: CONFIG.AUTH_TOKEN_KEY,
    allowedAdmins: CONFIG.ALLOWED_ADMINS,
    loginPassword: CONFIG.LOGIN_PASSWORD,
    mainSiteUrl: CONFIG.MAIN_SITE_URL,
    portfolioUrl: CONFIG.PORTFOLIO_URL,
    buyPlanUrl: CONFIG.BUY_PLAN_URL,
    assetBaseUrl: CONFIG.ASSET_BASE_URL
  };
})();
