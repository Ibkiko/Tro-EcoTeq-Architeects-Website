(function () {
  const listEl = document.getElementById("projects-list");
  const emptyEl = document.getElementById("projects-empty");
  const form = document.getElementById("project-form");
  const newBtn = document.getElementById("new-project-btn");
  const resetBtn = document.getElementById("reset-form-btn");
  const editorTitle = document.getElementById("editor-title");

  const fieldId = document.getElementById("project-id");
  const fieldTitle = document.getElementById("project-title");
  const fieldDesc = document.getElementById("project-description");
  const fieldLocation = document.getElementById("project-location");
  const fieldCategory = document.getElementById("project-category");
  const fieldImageUrl = document.getElementById("project-image-url");
  const fieldImageFile = document.getElementById("project-image-file");

  let onStatus = () => {};
  let currentEditId = null;

  function uid() {
    return "portfolio-" + Math.random().toString(36).slice(2, 8);
  }

  function setStatus(msg, tone) {
    onStatus(msg, tone);
  }

  function clearForm() {
    currentEditId = null;
    editorTitle.textContent = "Create Project";
    form.reset();
    fieldId.value = "";
  }

  function fillForm(project) {
    currentEditId = project.id;
    editorTitle.textContent = "Edit Project";
    fieldId.value = project.id;
    fieldTitle.value = project.title || "";
    fieldDesc.value = project.description || "";
    fieldLocation.value = project.location || "";
    fieldCategory.value = project.category || "";
    fieldImageUrl.value = project.image || "";
  }

  function projectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";
    card.innerHTML = `
      <div class="project-card-media">
        ${project.image ? `<img src="${project.image}" alt="${project.title || ""}" />` : `<div class="media-placeholder">No image</div>`}
      </div>
      <div class="project-card-body">
        <div class="project-card-head">
          <h3>${project.title || "Untitled"}</h3>
          <div class="project-card-meta">
            <span>${project.category || "Uncategorized"}</span>
            <span>•</span>
            <span>${project.location || "Unknown"}</span>
          </div>
        </div>
        <p>${project.description || ""}</p>
        <div class="project-card-actions">
          <button type="button" class="ghost small" data-edit="${project.id}">Edit</button>
          <button type="button" class="danger small" data-delete="${project.id}">Delete</button>
        </div>
      </div>
    `;
    return card;
  }

  function renderList(projects) {
    listEl.innerHTML = "";
    if (!projects.length) {
      emptyEl.classList.remove("hidden");
      return;
    }
    emptyEl.classList.add("hidden");
    projects.forEach((p) => listEl.appendChild(projectCard(p)));
  }

  async function loadProjects() {
    setStatus("Loading projects...");
    try {
      const projects = await window.AdminApi.getProjects();
      renderList(projects);
      setStatus(`Loaded ${projects.length} projects.`);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to load projects", "error");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      id: fieldId.value || uid(),
      title: fieldTitle.value.trim(),
      description: fieldDesc.value.trim(),
      location: fieldLocation.value.trim(),
      category: fieldCategory.value.trim(),
      image: fieldImageUrl.value.trim()
    };

    // If a file is chosen, read it as data URL and override image
    if (fieldImageFile.files && fieldImageFile.files[0]) {
      const file = fieldImageFile.files[0];
      payload.image = await readFileAsDataUrl(file);
    }

    try {
      if (currentEditId) {
        await window.AdminApi.updateProject(currentEditId, payload);
        setStatus("Project updated");
      } else {
        await window.AdminApi.createProject(payload);
        setStatus("Project created");
      }
      clearForm();
      await loadProjects();
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Save failed", "error");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this project?")) return;
    try {
      await window.AdminApi.deleteProject(id);
      setStatus("Project deleted");
      await loadProjects();
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Delete failed", "error");
    }
  }

  function wireEvents() {
    listEl.addEventListener("click", (event) => {
      const editId = event.target.getAttribute("data-edit");
      const deleteId = event.target.getAttribute("data-delete");
      if (editId) {
        const card = event.target.closest(".project-card");
        const project = card && card.dataset ? null : null;
        window.AdminApi.getProjects().then((projects) => {
          const found = projects.find((p) => p.id === editId);
          if (found) fillForm(found);
        });
      } else if (deleteId) {
        handleDelete(deleteId);
      }
    });

    form.addEventListener("submit", handleSubmit);
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearForm();
    });
    newBtn.addEventListener("click", () => {
      clearForm();
      fieldTitle.focus();
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function init(opts) {
    onStatus = opts.onStatus || (() => {});
    wireEvents();
    loadProjects();
  }

  window.AdminProjects = { init };
})();
