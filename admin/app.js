(() => {
  const statusEl = document.querySelector("[data-status]");
  const listEl = document.querySelector("[data-project-list]");
  const formEl = document.querySelector("#project-form");
  const submitBtn = formEl.querySelector("[data-submit]");
  const resetBtn = formEl.querySelector("[data-reset]");
  const loginView = document.querySelector("#login-view");
  const dashboardView = document.querySelector("#dashboard-view");
  const loginForm = document.querySelector("#login-form");
  const logoutBtn = document.querySelector("[data-logout]");
  const tokenKey = (window.ADMIN_META && window.ADMIN_META.tokenKey) || "tri_ecoteq_admin_token";
  const adminEmail = (window.ADMIN_META && window.ADMIN_META.adminEmail) || "";

  let editId = null;
  let demoMode = false;

  const DEMO_SOURCE = "../content/buy-plans.json";
  const DEMO_STORE_KEY = "teq-admin-demo-projects";

  function createDemoApi() {
    demoMode = true;

    async function loadSeed() {
      // Try cached demo store first
      const cached = localStorage.getItem(DEMO_STORE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          localStorage.removeItem(DEMO_STORE_KEY);
        }
      }
      // Fallback to static seed JSON
      try {
        const res = await fetch(DEMO_SOURCE, { cache: "no-store" });
        if (!res.ok) throw new Error("Seed fetch failed");
        const data = await res.json();
        const mapped = (data || []).map((item) => ({
          id: item.id,
          name: item.title,
          description: item.description,
          imageUrl: item.images?.[0] || "",
          status: item.offer ? "offer" : "published"
        }));
        localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(mapped));
        return mapped;
      } catch (err) {
        console.error("Demo seed load failed", err);
        return [];
      }
    }

    async function save(items) {
      localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(items));
      return items;
    }

    return {
      async fetchProjects() {
        return loadSeed();
      },
      async createProject(data) {
        const items = await loadSeed();
        const id = data.id || `local-${Date.now()}`;
        const next = [...items, { id, ...data }];
        return save(next);
      },
      async updateProject(id, data) {
        const items = await loadSeed();
        const next = items.map((p) => (p.id === id ? { ...p, ...data } : p));
        return save(next);
      },
      async deleteProject(id) {
        const items = await loadSeed();
        const next = items.filter((p) => p.id !== id);
        return save(next);
      }
    };
  }

  function disableForm() {
    formEl.querySelectorAll("input, textarea, select, button").forEach((el) => {
      el.disabled = true;
    });
  }

  function setAuthToken(rawToken) {
    const normalized =
      rawToken && rawToken.startsWith("Bearer ") ? rawToken : rawToken ? `Bearer ${rawToken}` : "";
    if (normalized) {
      localStorage.setItem(tokenKey, normalized);
      window.ADMIN_CONFIG.authToken = normalized;
    }
  }

  function hasAuthToken() {
    return Boolean(localStorage.getItem(tokenKey) || window.ADMIN_CONFIG.authToken);
  }

  function showLogin() {
    document.body.classList.add("is-guest");
    document.body.classList.remove("is-authenticated");
    loginView.classList.remove("hidden");
    dashboardView.classList.add("hidden");
  }

  function showDashboard() {
    document.body.classList.add("is-authenticated");
    document.body.classList.remove("is-guest");
    loginView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
  }

  function setStatus(message, tone = "info") {
    statusEl.textContent = message;
    statusEl.dataset.tone = tone;
  }

  function clearForm() {
    formEl.reset();
    editId = null;
    submitBtn.textContent = "Create Project";
    resetBtn.style.display = "none";
  }

  function projectRow(project) {
    const li = document.createElement("li");
    li.className = "project-row";
    li.dataset.id = project.id;
    li.innerHTML = `
      <div class="project-main">
        <strong>${project.name || "Untitled"}</strong>
        <span>${project.description || ""}</span>
        <small>ID: ${project.id}</small>
      </div>
      <div class="project-actions">
        <button type="button" class="ghost" data-edit>Edit</button>
        <button type="button" class="danger" data-delete>Delete</button>
      </div>
    `;
    return li;
  }

  async function loadProjects() {
    try {
      setStatus("Loading projects...");
      const data = await window.AdminApi.fetchProjects();
      const projects = Array.isArray(data) ? data : [];
      listEl.innerHTML = "";
      projects.forEach((project) => listEl.appendChild(projectRow(project)));
      setStatus(`Loaded ${projects.length} projects.`);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to load projects", "error");
    }
  }

  function handleEdit(projectEl) {
    const id = projectEl.dataset.id;
    const name = projectEl.querySelector("strong").textContent;
    const description = projectEl.querySelector("span").textContent;

    formEl.name.value = name;
    formEl.description.value = description;
    editId = id;
    submitBtn.textContent = "Update Project";
    resetBtn.style.display = "inline-flex";
    setStatus(`Editing project ${id}`);
  }

  async function handleDelete(projectEl) {
    const id = projectEl.dataset.id;
    const name = projectEl.querySelector("strong").textContent;
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      setStatus(`Deleting ${name}...`);
      await window.AdminApi.deleteProject(id);
      projectEl.remove();
      setStatus(`Deleted ${name}.`);
      if (editId === id) clearForm();
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to delete", "error");
    }
  }

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(formEl);
    const payload = {
      name: formData.get("name").trim(),
      description: formData.get("description").trim(),
      imageUrl: formData.get("imageUrl").trim(),
      status: formData.get("status")
    };

    try {
      if (editId) {
        setStatus("Updating project...");
        await window.AdminApi.updateProject(editId, payload);
      } else {
        setStatus("Creating project...");
        await window.AdminApi.createProject(payload);
      }
      clearForm();
      await loadProjects();
      setStatus(editId ? "Project updated." : "Project created.");
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Save failed", "error");
    }
  });

  resetBtn.addEventListener("click", (event) => {
    event.preventDefault();
    clearForm();
    setStatus("Ready.");
  });

  listEl.addEventListener("click", (event) => {
    const projectEl = event.target.closest("li.project-row");
    if (!projectEl) return;
    if (event.target.matches("[data-edit]")) {
      handleEdit(projectEl);
    } else if (event.target.matches("[data-delete]")) {
      handleDelete(projectEl);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const apiReady = window.AdminApi && typeof window.AdminApi.fetchProjects === "function";
    if (!apiReady) {
      window.AdminApi = createDemoApi();
      setStatus("Demo mode: data stored locally. Add admin/config.js to connect to real API.", "error");
    }

    if (!hasAuthToken()) {
      showLogin();
      setStatus("Login required");
    } else {
      showDashboard();
      clearForm();
      loadProjects();
    }

    if (loginForm) {
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const email = formData.get("email").trim();
        const token = formData.get("token").trim();

        if (adminEmail && email.toLowerCase() !== adminEmail.toLowerCase()) {
          setStatus("Email not allowed", "error");
          return;
        }
        if (!token) {
          setStatus("Enter token/password", "error");
          return;
        }
        setAuthToken(token);
        setStatus("Signed in");
        showDashboard();
        clearForm();
        loadProjects();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(tokenKey);
        window.ADMIN_CONFIG.authToken = "";
        demoMode = false;
        setStatus("Logged out");
        showLogin();
        disableForm();
      });
    }
  });
})();
