(() => {
  if (!window.ADMIN_CONFIG) {
    console.error("ADMIN_CONFIG is missing. Create admin/config.js from config.example.js.");
    return;
  }

  const { apiBaseUrl } = window.ADMIN_CONFIG;
  const tokenKey = (window.ADMIN_META && window.ADMIN_META.tokenKey) || "tri_ecoteq_admin_token";

  const baseHeaders = { "Content-Type": "application/json" };

  function getAuthToken() {
    const cfgToken = window.ADMIN_CONFIG.authToken || "";
    const stored = localStorage.getItem(tokenKey) || "";
    if (stored) {
      return stored.startsWith("Bearer ") ? stored : `Bearer ${stored}`;
    }
    if (cfgToken) {
      return cfgToken.startsWith("Bearer ") ? cfgToken : `Bearer ${cfgToken}`;
    }
    return "";
  }

  async function apiRequest(path, options = {}) {
    const url = `${apiBaseUrl}${path}`;
    const authToken = getAuthToken();
    const headers = { ...baseHeaders, ...(options.headers || {}) };
    if (authToken) headers.Authorization = authToken;

    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await response.json().catch(() => null) : await response.text();

    if (!response.ok) {
      const message = isJson && body && body.message ? body.message : response.statusText;
      throw new Error(message || `Request failed (${response.status})`);
    }

    return body;
  }

  window.AdminApi = {
    fetchProjects: () => apiRequest("/projects"),
    createProject: (data) =>
      apiRequest("/projects", { method: "POST", body: JSON.stringify(data) }),
    updateProject: (id, data) =>
      apiRequest(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteProject: (id) => apiRequest(`/projects/${id}`, { method: "DELETE" })
  };
})();
