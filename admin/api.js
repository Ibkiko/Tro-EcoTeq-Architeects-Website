(function () {
  const store = window.TEQContentStore;
  const tokenKey = (window.ADMIN_META && window.ADMIN_META.tokenKey) || "tri_ecoteq_admin_token";
  const apiBaseUrl = (window.ADMIN_CONFIG && window.ADMIN_CONFIG.apiBaseUrl) || "";

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

  async function fetchPortfolioJson() {
    try {
      const res = await fetch("../content/portfolio.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Content fetch failed");
      const json = await res.json();
      return Array.isArray(json) ? json : json.portfolioProjects || [];
    } catch (err) {
      return [];
    }
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

  async function getProjects() {
    const fromFile = await fetchPortfolioJson();
    if (fromFile.length) return fromFile.map(normalizeProject);
    return readFromStore().map(normalizeProject);
  }

  async function saveProjects(projects) {
    const normalized = projects.map(normalizeProject);
    saveToStore(normalized);
    // optional API sync if backend exists
    if (apiBaseUrl) {
      try {
        const token = localStorage.getItem(tokenKey) || window.ADMIN_CONFIG.authToken || "";
        await fetch(apiBaseUrl.replace(/\/$/, "") + "/projects-sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ projects: normalized })
        });
      } catch (err) {
        console.warn("Remote sync failed (local data saved)", err);
      }
    }
    return normalized;
  }

  async function createProject(project) {
    const projects = await getProjects();
    projects.push(normalizeProject(project));
    return saveProjects(projects);
  }

  async function updateProject(id, data) {
    const projects = await getProjects();
    const next = projects.map((p) => (p.id === id ? { ...p, ...normalizeProject(data), id } : p));
    return saveProjects(next);
  }

  async function deleteProject(id) {
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
