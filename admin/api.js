(function () {
  const store = window.TEQContentStore;
  const tokenKey = (window.ADMIN_META && window.ADMIN_META.tokenKey) || "tri_ecoteq_admin_token";
  const apiBaseUrl = (window.ADMIN_CONFIG && window.ADMIN_CONFIG.apiBaseUrl) || "/api";
  const apiRoot = apiBaseUrl.replace(/\/$/, "");
  // Seed store with bundled defaults if empty (ensures data even when remote fetch blocked)
  if (store && typeof store.getPortfolioProjects === "function" && store.getPortfolioProjects().length === 0) {
    if (typeof store.resetData === "function") {
      store.resetData();
    }
  }

  function normalizeProject(p) {
    return {
      id: p.id || "portfolio-" + Math.random().toString(36).slice(2, 8),
      title: p.title || "Untitled",
      description: p.description || "",
      category: p.category || "",
      location: p.location || "",
      year: p.year || "",
      priceLabel: p.priceLabel || "",
      image: p.image || ""
    };
  }

  function basePath() {
    const path = window.location.pathname || "/";
    const idx = path.indexOf("/admin/");
    if (idx >= 0) return path.slice(0, idx + 1); // keep trailing slash
    // fallback: strip file name
    return path.endsWith("/") ? path : path.replace(/[^/]+$/, "");
  }

  function withBase(relativePath) {
    const rel = relativePath.replace(/^\.?\/*/, "");
    return `${basePath()}${rel}`;
  }

  async function fetchPortfolioJson() {
    const candidates = [
      withBase("content/portfolio.json"),
      "/content/portfolio.json",
      "/admin/content/portfolio.json"
    ];
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json.portfolioProjects;
        if (Array.isArray(arr) && arr.length) return arr;
      } catch (err) {
        /* try next */
      }
    }
    return [];
  }

  function readFromStore() {
    if (store && typeof store.getPortfolioProjects === "function") {
      return store.getPortfolioProjects();
    }
    return [];
  }

  function saveToStore(projects) {
    if (!store || typeof store.saveData !== "function") return projects;
    const data = store.getData();
    const payload = { ...data, portfolioProjects: projects, updatedAt: new Date().toISOString() };
    store.saveData(payload);
    return projects;
  }

  function authHeaders() {
    const token = localStorage.getItem(tokenKey) || window.ADMIN_CONFIG.authToken || "";
    return token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {};
  }

  async function remoteRequest(path, options = {}) {
    const url = `${apiRoot}${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `API error (${res.status})`);
    }
    return res.json();
  }

  async function remoteGetProjects() {
    const json = await remoteRequest("/projects", { method: "GET" });
    return Array.isArray(json.projects) ? json.projects.map(normalizeProject) : [];
  }

  async function remoteCreateProject(project) {
    const json = await remoteRequest("/projects", { method: "POST", body: JSON.stringify(project) });
    await triggerRebuild();
    return Array.isArray(json.projects) ? json.projects.map(normalizeProject) : [];
  }

  async function remoteUpdateProject(id, data) {
    const json = await remoteRequest("/projects", { method: "PUT", body: JSON.stringify({ id, ...data }) });
    await triggerRebuild();
    return Array.isArray(json.projects) ? json.projects.map(normalizeProject) : [];
  }

  async function remoteDeleteProject(id) {
    const json = await remoteRequest("/projects", { method: "DELETE", body: JSON.stringify({ id }) });
    await triggerRebuild();
    return Array.isArray(json.projects) ? json.projects.map(normalizeProject) : [];
  }

  async function triggerRebuild() {
    const token = localStorage.getItem(tokenKey) || window.ADMIN_CONFIG.authToken || "";
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    try {
      const res = await fetch("/api/rebuild", {
        method: "POST",
        headers,
        body: JSON.stringify({ reason: "content-updated" })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Rebuild failed (${res.status})`);
      }
      return true;
    } catch (err) {
      console.warn("Rebuild trigger failed", err);
      return false;
    }
  }

  async function getProjects() {
    // Prefer shared API
    if (apiRoot) {
      try {
        return await remoteGetProjects();
      } catch (err) {
        console.warn("Remote fetch failed, falling back to local data", err);
      }
    }

    const fromStore = readFromStore();
    if (fromStore.length) return fromStore.map(normalizeProject);

    const fromFile = await fetchPortfolioJson();
    if (fromFile.length) return fromFile.map(normalizeProject);

    if (store && store.defaultData && store.defaultData.portfolioProjects) {
      return store.defaultData.portfolioProjects.map(normalizeProject);
    }
    return [];
  }

  async function saveProjects(projects) {
    const normalized = projects.map(normalizeProject);
    saveToStore(normalized);
    triggerRebuild();
    return normalized;
  }

  async function createProject(project) {
    if (apiRoot) {
      try {
        return await remoteCreateProject(project);
      } catch (err) {
        console.warn("Remote create failed, falling back to local data", err);
      }
    }
    const projects = await getProjects();
    projects.push(normalizeProject(project));
    return saveProjects(projects);
  }

  async function updateProject(id, data) {
    if (apiRoot) {
      try {
        return await remoteUpdateProject(id, data);
      } catch (err) {
        console.warn("Remote update failed, falling back to local data", err);
      }
    }
    const projects = await getProjects();
    const next = projects.map((p) => (p.id === id ? { ...p, ...normalizeProject(data), id } : p));
    return saveProjects(next);
  }

  async function deleteProject(id) {
    if (apiRoot) {
      try {
        return await remoteDeleteProject(id);
      } catch (err) {
        console.warn("Remote delete failed, falling back to local data", err);
      }
    }
    const projects = await getProjects();
    const next = projects.filter((p) => p.id !== id);
    return saveProjects(next);
  }

  window.AdminApi = {
    getProjects,
    createProject,
    updateProject,
    deleteProject
  };
})();
