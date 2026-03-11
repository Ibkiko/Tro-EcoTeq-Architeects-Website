(function () {
  var store = window.TEQContentStore;
  var AUTH_KEY = "teq-admin-auth-v1";
  var SESSION_KEY = "teq-admin-session-v1";
  var GIT_SETTINGS_KEY = "teq-admin-git-settings-v1";
  var DEFAULT_AUTH = {
    accounts: [
      { username: "josejacques98@gmail.com", password: "Teq@2026" },
      { username: "ibrahibkiko26@gmail.com", password: "Teq@2026" }
    ]
  };
  var DEFAULT_GIT_SETTINGS = {
    owner: "Ibkiko",
    repo: "Tri-EcoTeq-Architects-Website",
    branch: "cms",
    token: "",
    autoPublish: false
  };

  var loginView = document.getElementById("loginView");
  var dashboardView = document.getElementById("dashboardView");
  var loginForm = document.getElementById("loginForm");
  var logoutBtn = document.getElementById("logoutBtn");
  var statusMessage = document.getElementById("statusMessage");
  var statsPanel = document.getElementById("statsPanel");
  var projectList = document.getElementById("projectList");
  var planList = document.getElementById("planList");
  var importFile = document.getElementById("importFile");

  var projectForm = document.getElementById("projectForm");
  var projectOriginalId = document.getElementById("projectOriginalId");
  var projectId = document.getElementById("projectId");
  var projectTitle = document.getElementById("projectTitle");
  var projectCategory = document.getElementById("projectCategory");
  var projectYear = document.getElementById("projectYear");
  var projectLocation = document.getElementById("projectLocation");
  var projectDescription = document.getElementById("projectDescription");
  var projectPriceLabel = document.getElementById("projectPriceLabel");
  var projectImage = document.getElementById("projectImage");
  var projectImageFile = document.getElementById("projectImageFile");

  var planForm = document.getElementById("planForm");
  var planOriginalId = document.getElementById("planOriginalId");
  var planId = document.getElementById("planId");
  var planTitle = document.getElementById("planTitle");
  var planDescription = document.getElementById("planDescription");
  var planCurrentPrice = document.getElementById("planCurrentPrice");
  var planOldPrice = document.getElementById("planOldPrice");
  var planOffer = document.getElementById("planOffer");
  var planImages = document.getElementById("planImages");
  var planImageFiles = document.getElementById("planImageFiles");

  var credentialsForm = document.getElementById("credentialsForm");
  var adminUsername = document.getElementById("adminUsername");
  var adminPassword = document.getElementById("adminPassword");
  var gitSettingsForm = document.getElementById("gitSettingsForm");
  var gitRepoOwner = document.getElementById("gitRepoOwner");
  var gitRepoName = document.getElementById("gitRepoName");
  var gitBranch = document.getElementById("gitBranch");
  var gitToken = document.getElementById("gitToken");
  var gitAutoPublish = document.getElementById("gitAutoPublish");
  var publishPlansBtn = document.getElementById("publishPlansBtn");

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeAuth(auth) {
    var raw = auth || {};
    if (Array.isArray(raw.accounts) && raw.accounts.length) {
      return {
        accounts: raw.accounts
          .map(function (account) {
            return {
              username: String(account && account.username || "").trim().toLowerCase(),
              password: String(account && account.password || "")
            };
          })
          .filter(function (account) {
            return account.username && account.password;
          })
      };
    }

    if (raw.username && raw.password) {
      return {
        accounts: [
          {
            username: String(raw.username).trim().toLowerCase(),
            password: String(raw.password)
          }
        ]
      };
    }

    return clone(DEFAULT_AUTH);
  }

  function getAuth() {
    try {
      var raw = window.localStorage.getItem(AUTH_KEY);
      return raw ? normalizeAuth(JSON.parse(raw)) : clone(DEFAULT_AUTH);
    } catch (error) {
      return clone(DEFAULT_AUTH);
    }
  }

  function saveAuth(auth) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(normalizeAuth(auth)));
  }

  function normalizeGitSettings(settings) {
    var raw = settings || {};
    return {
      owner: String(raw.owner || DEFAULT_GIT_SETTINGS.owner).trim(),
      repo: String(raw.repo || DEFAULT_GIT_SETTINGS.repo).trim(),
      branch: String(raw.branch || DEFAULT_GIT_SETTINGS.branch).trim() || DEFAULT_GIT_SETTINGS.branch,
      token: String(raw.token || ""),
      autoPublish: Boolean(raw.autoPublish)
    };
  }

  function getGitSettings() {
    try {
      var raw = window.localStorage.getItem(GIT_SETTINGS_KEY);
      return raw ? normalizeGitSettings(JSON.parse(raw)) : clone(DEFAULT_GIT_SETTINGS);
    } catch (error) {
      return clone(DEFAULT_GIT_SETTINGS);
    }
  }

  function saveGitSettings(settings) {
    window.localStorage.setItem(GIT_SETTINGS_KEY, JSON.stringify(normalizeGitSettings(settings)));
  }

  function isLoggedIn() {
    return window.sessionStorage.getItem(SESSION_KEY) === "true";
  }

  function setLoggedIn(value) {
    if (value) {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } else {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }

  function showStatus(message) {
    statusMessage.textContent = message;
    statusMessage.classList.add("show");
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(function () {
      statusMessage.classList.remove("show");
    }, 2200);
  }

  function readFilesAsDataUrls(fileList) {
    var files = Array.from(fileList || []);
    return Promise.all(files.map(function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(String(reader.result || ""));
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }));
  }

  function splitLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map(function (entry) {
        return entry.trim();
      })
      .filter(Boolean);
  }

  function slugifyFilePart(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function dataUrlToBase64(dataUrl) {
    var match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return {
      mimeType: match[1],
      content: match[2]
    };
  }

  function extensionFromMimeType(mimeType) {
    if (mimeType === "image/jpeg") return "jpg";
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/webp") return "webp";
    if (mimeType === "image/gif") return "gif";
    return "png";
  }

  function encodeUtf8Base64(value) {
    return window.btoa(unescape(encodeURIComponent(value)));
  }

  function getData() {
    return store ? store.getData() : { portfolioProjects: [], plans: [] };
  }

  function saveData(nextData) {
    if (!store) return;
    store.saveData(nextData);
    renderAll();
  }

  function formatUsd(value) {
    return "$" + Number(value || 0).toLocaleString("en-US");
  }

  function resolveAdminAssetPath(path) {
    var value = String(path || "").trim();
    if (!value) return "";
    if (/^(data:|https?:|blob:)/i.test(value)) {
      return value;
    }
    if (value.indexOf("admin/") === 0) {
      return value.slice("admin/".length);
    }
    return value;
  }

  function setActiveTab(targetId) {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.classList.toggle("is-active", tab.getAttribute("data-tab-target") === targetId);
    });
    document.querySelectorAll(".tab-panel").forEach(function (panel) {
      panel.classList.toggle("is-active", panel.id === targetId);
    });
  }

  function clearProjectForm() {
    projectForm.reset();
    projectOriginalId.value = "";
  }

  function clearPlanForm() {
    planForm.reset();
    planOriginalId.value = "";
    planOffer.checked = false;
  }

  function loadProjectIntoForm(project) {
    projectOriginalId.value = project.id;
    projectId.value = project.id;
    projectTitle.value = project.title;
    projectCategory.value = project.category;
    projectYear.value = project.year;
    projectLocation.value = project.location;
    projectDescription.value = project.description;
    projectPriceLabel.value = project.priceLabel || "";
    projectImage.value = project.image || "";
    projectImageFile.value = "";
    setActiveTab("portfolioTab");
  }

  function loadPlanIntoForm(plan) {
    planOriginalId.value = plan.id;
    planId.value = plan.id;
    planTitle.value = plan.title || plan.id;
    planDescription.value = plan.description;
    planCurrentPrice.value = plan.currentPrice;
    planOldPrice.value = plan.oldPrice === null ? "" : plan.oldPrice;
    planOffer.checked = Boolean(plan.offer);
    planImages.value = (plan.images || []).join("\n");
    planImageFiles.value = "";
    setActiveTab("plansTab");
  }

  function renderStats() {
    var data = getData();
    var offerPlans = data.plans.filter(function (plan) {
      return plan.offer;
    }).length;

    statsPanel.innerHTML = "";

    [
      { label: "Portfolio Projects", value: data.portfolioProjects.length },
      { label: "Buy Plans", value: data.plans.length },
      { label: "Offer Plans", value: offerPlans },
      { label: "Last Sync", value: new Date().toLocaleDateString("en-US") }
    ].forEach(function (item) {
      var card = document.createElement("div");
      card.className = "stat-card";

      var label = document.createElement("span");
      label.textContent = item.label;

      var value = document.createElement("strong");
      value.textContent = item.value;

      card.appendChild(label);
      card.appendChild(value);
      statsPanel.appendChild(card);
    });
  }

  function renderProjectList() {
    var projects = getData().portfolioProjects;
    projectList.innerHTML = "";

    if (!projects.length) {
      projectList.innerHTML = '<div class="admin-item"><p>No portfolio projects yet.</p></div>';
      return;
    }

    projects.forEach(function (project) {
      var item = document.createElement("article");
      item.className = "admin-item";

      var top = document.createElement("div");
      top.className = "admin-item-top";

      var titleWrap = document.createElement("div");
      var heading = document.createElement("h3");
      heading.textContent = project.title;
      var meta = document.createElement("div");
      meta.className = "admin-item-meta";
      [project.category, project.year, project.location].forEach(function (value) {
        var pill = document.createElement("span");
        pill.className = "pill";
        pill.textContent = value;
        meta.appendChild(pill);
      });
      titleWrap.appendChild(heading);
      titleWrap.appendChild(meta);

      var actions = document.createElement("div");
      actions.className = "admin-item-actions";

      var edit = document.createElement("button");
      edit.type = "button";
      edit.className = "ghost small";
      edit.textContent = "Edit";
      edit.addEventListener("click", function () {
        loadProjectIntoForm(project);
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "danger small";
      remove.textContent = "Delete";
      remove.addEventListener("click", function () {
        if (!window.confirm("Delete " + project.title + "?")) return;
        var data = getData();
        data.portfolioProjects = data.portfolioProjects.filter(function (entry) {
          return entry.id !== project.id;
        });
        saveData(data);
        showStatus("Project deleted");
      });

      actions.appendChild(edit);
      actions.appendChild(remove);
      top.appendChild(titleWrap);
      top.appendChild(actions);
      item.appendChild(top);

      if (project.image) {
        var image = document.createElement("img");
        image.src = resolveAdminAssetPath(project.image);
        image.alt = project.title;
        item.appendChild(image);
      }

      var description = document.createElement("p");
      description.textContent = project.description;
      item.appendChild(description);

      if (project.priceLabel) {
        var price = document.createElement("span");
        price.className = "pill";
        price.textContent = project.priceLabel;
        item.appendChild(price);
      }

      projectList.appendChild(item);
    });
  }

  function renderPlanList() {
    var plans = getData().plans;
    planList.innerHTML = "";

    if (!plans.length) {
      planList.innerHTML = '<div class="admin-item"><p>No buy plans yet.</p></div>';
      return;
    }

    plans.forEach(function (plan) {
      var item = document.createElement("article");
      item.className = "admin-item";

      var top = document.createElement("div");
      top.className = "admin-item-top";

      var titleWrap = document.createElement("div");
      var heading = document.createElement("h3");
      heading.textContent = plan.title || plan.id;
      var meta = document.createElement("div");
      meta.className = "admin-item-meta";

      [plan.id, formatUsd(plan.currentPrice), plan.offer ? "Offer" : "Standard"].forEach(function (value) {
        var pill = document.createElement("span");
        pill.className = "pill";
        pill.textContent = value;
        meta.appendChild(pill);
      });

      if (plan.oldPrice) {
        var oldPrice = document.createElement("span");
        oldPrice.className = "pill";
        oldPrice.textContent = "Was " + formatUsd(plan.oldPrice);
        meta.appendChild(oldPrice);
      }

      titleWrap.appendChild(heading);
      titleWrap.appendChild(meta);

      var actions = document.createElement("div");
      actions.className = "admin-item-actions";

      var edit = document.createElement("button");
      edit.type = "button";
      edit.className = "ghost small";
      edit.textContent = "Edit";
      edit.addEventListener("click", function () {
        loadPlanIntoForm(plan);
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "danger small";
      remove.textContent = "Delete";
      remove.addEventListener("click", function () {
        if (!window.confirm("Delete " + (plan.title || plan.id) + "?")) return;
        var data = getData();
        data.plans = data.plans.filter(function (entry) {
          return entry.id !== plan.id;
        });
        saveData(data);
        showStatus("Plan deleted");
      });

      actions.appendChild(edit);
      actions.appendChild(remove);
      top.appendChild(titleWrap);
      top.appendChild(actions);
      item.appendChild(top);

      if (plan.images && plan.images[0]) {
        var image = document.createElement("img");
        image.src = resolveAdminAssetPath(plan.images[0]);
        image.alt = plan.title || plan.id;
        item.appendChild(image);
      }

      var description = document.createElement("p");
      description.textContent = plan.description;
      item.appendChild(description);

      planList.appendChild(item);
    });
  }

  function renderCredentials() {
    var auth = getAuth();
    var primaryAccount = auth.accounts[0] || { username: "", password: "" };
    adminUsername.value = primaryAccount.username;
    adminPassword.value = primaryAccount.password;
  }

  function renderGitSettings() {
    var settings = getGitSettings();
    gitRepoOwner.value = settings.owner;
    gitRepoName.value = settings.repo;
    gitBranch.value = settings.branch;
    gitToken.value = settings.token;
    gitAutoPublish.checked = settings.autoPublish;
  }

  function renderAll() {
    renderStats();
    renderProjectList();
    renderPlanList();
    renderCredentials();
    renderGitSettings();
  }

  function getGithubApiBase(settings) {
    return "https://api.github.com/repos/" + encodeURIComponent(settings.owner) + "/" + encodeURIComponent(settings.repo) + "/contents/";
  }

  async function githubRequest(path, options, settings) {
    var requestOptions = options || {};
    requestOptions.headers = Object.assign({
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer " + settings.token
    }, requestOptions.headers || {});

    var response = await window.fetch(getGithubApiBase(settings) + path, requestOptions);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      var text = await response.text();
      throw new Error(text || "GitHub request failed");
    }
    return response.json();
  }

  async function getGithubFileSha(path, settings) {
    var result = await githubRequest(path + "?ref=" + encodeURIComponent(settings.branch), { method: "GET" }, settings);
    return result && result.sha ? result.sha : null;
  }

  async function putGithubFile(path, contentBase64, message, settings) {
    var sha = await getGithubFileSha(path, settings);
    var payload = {
      message: message,
      content: contentBase64,
      branch: settings.branch
    };
    if (sha) {
      payload.sha = sha;
    }

    return githubRequest(path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }, settings);
  }

  async function publishBuyPlansToGithub() {
    var settings = getGitSettings();
    var data = getData();
    var plans = clone(data.plans || []);

    if (!settings.owner || !settings.repo || !settings.branch || !settings.token) {
      throw new Error("GitHub settings are incomplete");
    }

    for (var i = 0; i < plans.length; i += 1) {
      var plan = plans[i];
      var nextImages = [];
      for (var j = 0; j < (plan.images || []).length; j += 1) {
        var image = plan.images[j];
        var dataUrl = dataUrlToBase64(image);

        if (!dataUrl) {
          nextImages.push(image);
          continue;
        }

        var extension = extensionFromMimeType(dataUrl.mimeType);
        var filename = slugifyFilePart(plan.id || plan.title || "plan") + "-" + String(Date.now()) + "-" + String(j + 1) + "." + extension;
        var repoPath = "Images/Buy-Plan/" + filename;

        await putGithubFile(repoPath, dataUrl.content, "Upload Buy Plan image for " + (plan.id || plan.title || "plan"), settings);
        nextImages.push(repoPath);
      }
      plan.images = nextImages;
    }

    await putGithubFile(
      "content/buy-plans.json",
      encodeUtf8Base64(JSON.stringify(plans, null, 2)),
      "Update Buy Plan content from admin",
      settings
    );

    data.plans = plans;
    saveData(data);
  }

  function syncAuthView() {
    var loggedIn = isLoggedIn();
    document.body.classList.toggle("is-authenticated", loggedIn);
    document.body.classList.toggle("is-guest", !loggedIn);
    loginView.classList.toggle("hidden", loggedIn);
    dashboardView.classList.toggle("hidden", !loggedIn);
    if (loggedIn) {
      renderAll();
    }
  }

  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      setActiveTab(tab.getAttribute("data-tab-target"));
    });
  });

  document.getElementById("newProjectBtn").addEventListener("click", clearProjectForm);
  document.getElementById("clearProjectFormBtn").addEventListener("click", clearProjectForm);
  document.getElementById("newPlanBtn").addEventListener("click", clearPlanForm);
  document.getElementById("clearPlanFormBtn").addEventListener("click", clearPlanForm);

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var auth = getAuth();
    var username = document.getElementById("loginUsername").value.trim().toLowerCase();
    var password = document.getElementById("loginPassword").value;

    var matched = auth.accounts.some(function (account) {
      return account.username === username && account.password === password;
    });

    if (matched) {
      setLoggedIn(true);
      syncAuthView();
      showStatus("Signed in");
      loginForm.reset();
      return;
    }

    showStatus("Invalid admin login");
  });

  logoutBtn.addEventListener("click", function () {
    setLoggedIn(false);
    syncAuthView();
    showStatus("Logged out");
  });

  projectForm.addEventListener("submit", function (event) {
    event.preventDefault();

    readFilesAsDataUrls(projectImageFile.files).then(function (uploads) {
      var data = getData();
      var originalId = projectOriginalId.value.trim();
      var nextId = projectId.value.trim();

      if (!nextId) {
        showStatus("Project ID is required");
        return;
      }

      var exists = data.portfolioProjects.some(function (project) {
        return project.id === nextId && project.id !== originalId;
      });
      if (exists) {
        showStatus("Project ID already exists");
        return;
      }

      var nextProject = {
        id: nextId,
        title: projectTitle.value.trim(),
        category: projectCategory.value.trim(),
        year: projectYear.value.trim(),
        location: projectLocation.value.trim(),
        description: projectDescription.value.trim(),
        priceLabel: projectPriceLabel.value.trim(),
        image: uploads[0] || projectImage.value.trim()
      };

      if (originalId) {
        data.portfolioProjects = data.portfolioProjects.map(function (project) {
          return project.id === originalId ? nextProject : project;
        });
      } else {
        data.portfolioProjects.unshift(nextProject);
      }

      saveData(data);
      clearProjectForm();
      showStatus("Project saved");
    }).catch(function () {
      showStatus("Image upload failed");
    });
  });

  planForm.addEventListener("submit", function (event) {
    event.preventDefault();

    readFilesAsDataUrls(planImageFiles.files).then(function (uploads) {
      var data = getData();
      var originalId = planOriginalId.value.trim();
      var nextId = planId.value.trim();

      if (!nextId) {
        showStatus("Plan ID is required");
        return;
      }

      var exists = data.plans.some(function (plan) {
        return plan.id === nextId && plan.id !== originalId;
      });
      if (exists) {
        showStatus("Plan ID already exists");
        return;
      }

      var nextPlan = {
        id: nextId,
        title: planTitle.value.trim() || nextId,
        description: planDescription.value.trim(),
        currentPrice: Number(planCurrentPrice.value || 0),
        oldPrice: planOldPrice.value === "" ? null : Number(planOldPrice.value),
        offer: planOffer.checked,
        images: splitLines(planImages.value).concat(uploads)
      };

      if (originalId) {
        data.plans = data.plans.map(function (plan) {
          return plan.id === originalId ? nextPlan : plan;
        });
      } else {
        data.plans.unshift(nextPlan);
      }

      saveData(data);
      clearPlanForm();
      var gitSettings = getGitSettings();
      if (gitSettings.autoPublish && gitSettings.token) {
        return publishBuyPlansToGithub().then(function () {
          showStatus("Plan saved and published");
        });
      }
      showStatus("Plan saved");
    }).catch(function () {
      showStatus("Plan save failed");
    });
  });

  credentialsForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var auth = getAuth();
    var primaryEmail = adminUsername.value.trim().toLowerCase();
    var primaryPassword = adminPassword.value;

    if (!primaryEmail || !primaryPassword) {
      showStatus("Username and password are required");
      return;
    }

    if (auth.accounts.length) {
      auth.accounts[0] = { username: primaryEmail, password: primaryPassword };
    } else {
      auth.accounts = [{ username: primaryEmail, password: primaryPassword }];
    }

    saveAuth(auth);
    showStatus("Admin login updated");
  });

  gitSettingsForm.addEventListener("submit", function (event) {
    event.preventDefault();
    saveGitSettings({
      owner: gitRepoOwner.value,
      repo: gitRepoName.value,
      branch: gitBranch.value,
      token: gitToken.value,
      autoPublish: gitAutoPublish.checked
    });
    showStatus("GitHub settings saved");
  });

  document.getElementById("exportBtn").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(getData(), null, 2)], { type: "application/json" });
    var href = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = href;
    link.download = "teq-content-export.json";
    link.click();
    URL.revokeObjectURL(href);
    showStatus("Content exported");
  });

  importFile.addEventListener("change", function () {
    var file = importFile.files && importFile.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result || "{}"));
        saveData(parsed);
        clearProjectForm();
        clearPlanForm();
        showStatus("Content imported");
      } catch (error) {
        showStatus("Invalid JSON import");
      } finally {
        importFile.value = "";
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    if (!window.confirm("Reset all content to the default site data?")) return;
    store.resetData();
    clearProjectForm();
    clearPlanForm();
    renderAll();
    showStatus("Defaults restored");
  });

  publishPlansBtn.addEventListener("click", function () {
    publishPlansBtn.disabled = true;
    publishBuyPlansToGithub().then(function () {
      showStatus("Buy Plans published to GitHub");
    }).catch(function (error) {
      console.error(error);
      showStatus("GitHub publish failed");
    }).finally(function () {
      publishPlansBtn.disabled = false;
    });
  });

  window.addEventListener("teq-content-store:change", renderAll);

  syncAuthView();
  setActiveTab("portfolioTab");
})();
