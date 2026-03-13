(function () {
  const SESSION_KEY = "admin_logged_in_v1";
  const statusEl = document.querySelector("[data-status]");
  const apiUrlLabel = document.getElementById("api-url-label");
  const logoutBtn = document.querySelector("[data-logout]");
  const navLinks = document.querySelectorAll(".nav-link[data-nav]");
  const panelDashboard = document.getElementById("dashboard-panel");
  const editorPanel = document.getElementById("editor-panel");

  function requireSession() {
    if (localStorage.getItem(SESSION_KEY) !== "1") {
      window.location.href = "login.html";
    }
  }

  function setStatus(msg, tone) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.tone = tone || "info";
  }

  function initNav() {
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
        const target = link.dataset.nav;
        if (target === "dashboard") {
          panelDashboard.classList.remove("hidden");
          editorPanel.classList.remove("hidden");
        } else if (target === "projects") {
          panelDashboard.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  function initLogout() {
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      const tokenKey = (window.ADMIN_META && window.ADMIN_META.tokenKey) || "tri_ecoteq_admin_token";
      localStorage.removeItem(tokenKey);
      window.ADMIN_CONFIG.authToken = "";
      window.location.href = "login.html";
    });
  }

  function initMeta() {
    if (apiUrlLabel) {
      apiUrlLabel.textContent = window.ADMIN_CONFIG.apiBaseUrl || "local content";
    }
  }

  function applyAssets() {
    const resolver =
      (typeof window.assetUrl === "function" && window.assetUrl) ||
      ((path) => path);
    document.querySelectorAll("[data-asset-path]").forEach((el) => {
      const path = el.getAttribute("data-asset-path");
      if (!path) return;
      el.src = resolver(path);
    });
  }

  function applyMainLinks() {
    const meta = window.ADMIN_META || {};
    const cfg = window.ADMIN_CONFIG || {};
    const origin = window.location.origin.replace(/\/$/, "");

    const mainUrl = meta.mainSiteUrl || cfg.mainSiteUrl || `${origin}/index.html`;
    const portfolioUrl = meta.portfolioUrl || cfg.portfolioUrl || `${origin}/portfolio.html`;
    const buyPlanUrl = meta.buyPlanUrl || cfg.buyPlanUrl || `${origin}/buy-plan.html`;

    const targets = [
      { selector: "[data-link-main]", href: mainUrl },
      { selector: "[data-link-portfolio]", href: portfolioUrl },
      { selector: "[data-link-buy-plan]", href: buyPlanUrl }
    ];

    targets.forEach(({ selector, href }) => {
      if (!href) return;
      document.querySelectorAll(selector).forEach((el) => {
        el.href = href;
        el.target = "_blank";
        el.rel = "noreferrer noopener";
      });
    });
  }

  function initProjects() {
    if (window.AdminProjects) {
      window.AdminProjects.init({
        onStatus: setStatus
      });

      const reloadBtn = document.getElementById("reload-projects");
      if (reloadBtn) {
        reloadBtn.addEventListener("click", () => {
          window.AdminProjects.reload();
        });
      }
    }
  }

  function init() {
    requireSession();
    initNav();
    initLogout();
    initMeta();
    applyMainLinks();
    applyAssets();
    initProjects();
    setStatus("Ready");
    const loader = document.querySelector("[data-page-loader]");
    if (loader) loader.style.display = "none";
  }

  document.addEventListener("DOMContentLoaded", init);
})();
