(function (window) {
  var STORAGE_KEY = "teq-content-store-v1";

  var defaultData = {
    portfolioProjects: [
      {
        id: "portfolio-2024-01",
        title: "Portfolio Series 2024-01",
        category: "Residential",
        location: "Nairobi, Kenya",
        year: "2024",
        description: "Contemporary residential concept balancing natural light, privacy, and efficient internal flow.",
        priceLabel: "",
        image: "admin/portfolio-library/IMG-20240131-WA0009.jpg"
      },
      {
        id: "portfolio-2024-04",
        title: "Portfolio Series 2024-04",
        category: "Interior",
        location: "Nairobi, Kenya",
        year: "2024",
        description: "Refined interior composition with warm finishes, layered materials, and practical spatial detailing.",
        priceLabel: "",
        image: "admin/portfolio-library/IMG_20240411_174334.jpg"
      },
      {
        id: "portfolio-2024-08",
        title: "Portfolio Series 2024-08",
        category: "Residential",
        location: "Nairobi, Kenya",
        year: "2024",
        description: "A modern home study focused on structural clarity, clean massing, and livable family spaces.",
        priceLabel: "",
        image: "admin/portfolio-library/IMG-20240806-WA0004.jpg"
      },
      {
        id: "portfolio-2025-04",
        title: "Portfolio Series 2025-04",
        category: "Commercial",
        location: "Nairobi, Kenya",
        year: "2025",
        description: "Commercial project work centered on visibility, user circulation, and cost-conscious execution.",
        priceLabel: "",
        image: "admin/portfolio-library/IMG-20250430-WA0004.jpg"
      },
      {
        id: "portfolio-2025-05",
        title: "Portfolio Series 2025-05",
        category: "Institutional",
        location: "Nairobi, Kenya",
        year: "2025",
        description: "Institutional design direction that prioritizes durability, accessibility, and disciplined planning.",
        priceLabel: "",
        image: "admin/portfolio-library/IMG-20250517-WA0003.jpg"
      },
      {
        id: "portfolio-2025-06",
        title: "Portfolio Series 2025-06",
        category: "Hospitality",
        location: "Nairobi, Kenya",
        year: "2025",
        description: "Hospitality-focused design with layered guest experiences and a strong visual identity.",
        priceLabel: "",
        image: "admin/portfolio-library/IMG-20250620-WA0007.jpg"
      },
      {
        id: "portfolio-2025-08",
        title: "Portfolio Series 2025-08",
        category: "Mixed-use",
        location: "Nairobi, Kenya",
        year: "2025",
        description: "Mixed-use proposal shaped around adaptable ground-floor activation and efficient upper-level planning.",
        priceLabel: "",
        image: "admin/portfolio-library/IMG-20250811-WA0001.jpg"
      },
      {
        id: "portfolio-2025-10",
        title: "Portfolio Series 2025-10",
        category: "Civic",
        location: "Nairobi, Kenya",
        year: "2025",
        description: "Civic-facing scheme designed for public presence, clear navigation, and robust long-term use.",
        priceLabel: "",
        image: "admin/portfolio-library/IMG-20251031-WA0000.jpg"
      }
    ],
    plans: [
      {
        id: "Proj-2023-002",
        title: "Proj-2023-002",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 550,
        oldPrice: null,
        offer: false,
        images: ["/Images/Buy-Plan/Proj-2023-002.jpg"]
      },
      {
        id: "Proj-2023-003",
        title: "Proj-2023-003",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 195,
        oldPrice: 200,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2023-003.jpg",
          "/Images/Buy-Plan/Proj-2023-0031.jpg",
          "/Images/Buy-Plan/Proj-2023-0032.jpg"
        ]
      },
      {
        id: "Proj-2023-008",
        title: "Proj-2023-008",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 670,
        oldPrice: 830,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2023-008.jpg",
          "/Images/Buy-Plan/Proj-2023-0081.jpg"
        ]
      },
      {
        id: "Proj-2024-004",
        title: "Proj-2024-004",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 1500,
        oldPrice: 2000,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2024-004.jpg",
          "/Images/Buy-Plan/Proj-2024-0041.jpg"
        ]
      },
      {
        id: "Proj-2024-005",
        title: "Proj-2024-005",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 1999,
        oldPrice: 2500,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2024-005.jpg",
          "/Images/Buy-Plan/Proj-2024-0051.jpg",
          "/Images/Buy-Plan/Proj-2024-0052.jpg"
        ]
      },
      {
        id: "Proj-2024-006",
        title: "Proj-2024-006",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 95,
        oldPrice: 150,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2024-006.jpg",
          "/Images/Buy-Plan/Proj-2024-0061.jpg"
        ]
      },
      {
        id: "Proj-2025-001",
        title: "Proj-2025-001",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 230,
        oldPrice: null,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2025-001.jpg",
          "/Images/Buy-Plan/Proj-2025-0011.jpg"
        ]
      },
      {
        id: "Proj-2025-003",
        title: "Proj-2025-003",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 450,
        oldPrice: null,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2025-003.jpg",
          "/Images/Buy-Plan/Proj-2025-0031.jpg"
        ]
      },
      {
        id: "Proj-2025-005",
        title: "Proj-2025-005",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 950,
        oldPrice: 1300,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2025-005.jpg",
          "/Images/Buy-Plan/Proj-2025-0051.jpg"
        ]
      },
      {
        id: "Proj-2025-006",
        title: "Proj-2025-006",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 1450,
        oldPrice: 1850,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2025-006.jpg",
          "/Images/Buy-Plan/Proj-2025-0061.jpg"
        ]
      },
      {
        id: "Proj-2025-007",
        title: "Proj-2025-007",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 3050,
        oldPrice: 3500,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2025-007.jpg",
          "/Images/Buy-Plan/Proj-2025-0071.jpg"
        ]
      },
      {
        id: "Proj-2025-008",
        title: "Proj-2025-008",
        description: "Ready completed design package with architectural working drawings and structural plans.",
        currentPrice: 1350,
        oldPrice: 1500,
        offer: false,
        images: [
          "/Images/Buy-Plan/Proj-2025-008.jpg",
          "/Images/Buy-Plan/Proj-2025-0081.jpg"
        ]
      },
      {
        id: "Proj-2022-0091",
        title: "Proj-2022-0091",
        description: "Offer plan unlocked when you add 3 or more paid plans to cart.",
        currentPrice: 0,
        oldPrice: null,
        offer: true,
        images: [
          "/Images/Buy-Plan/Screenshot_2024-08-27-23-23-52-805_com.microsoft.skydrive.png",
          "/Images/Buy-Plan/Screenshot_2024-08-27-23-24-22-382_com.microsoft.skydrive.png"
        ]
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function safeNumber(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function sanitizeImages(images, fallbackImage) {
    var list = Array.isArray(images) ? images : [];
    var cleaned = list.map(safeString).filter(Boolean);
    if (!cleaned.length && fallbackImage) {
      cleaned.push(safeString(fallbackImage));
    }
    return cleaned;
  }

  function sanitizePortfolioProject(project, index) {
    var normalized = project || {};
    return {
      id: safeString(normalized.id) || "portfolio-item-" + index,
      title: safeString(normalized.title) || "Untitled Project",
      category: safeString(normalized.category) || "General",
      location: safeString(normalized.location) || "Nairobi, Kenya",
      year: safeString(normalized.year) || "2026",
      description: safeString(normalized.description),
      priceLabel: safeString(normalized.priceLabel),
      image: normalizePortfolioImage(safeString(normalized.image))
    };
  }

  function normalizePortfolioImage(imagePath) {
    var value = safeString(imagePath);
    if (value.indexOf("assets/portfolio/") === 0) {
      return "admin/portfolio-library/" + value.slice("assets/portfolio/".length);
    }
    return value;
  }

  function sanitizePlan(plan, index) {
    var normalized = plan || {};
    return {
      id: safeString(normalized.id) || "plan-" + index,
      title: safeString(normalized.title) || safeString(normalized.id) || "Untitled Plan",
      description: safeString(normalized.description),
      currentPrice: safeNumber(normalized.currentPrice) || 0,
      oldPrice: safeNumber(normalized.oldPrice),
      offer: Boolean(normalized.offer),
      images: sanitizeImages(normalized.images, normalized.image)
    };
  }

  function sanitizeData(data) {
    var normalized = data || {};
    return {
      portfolioProjects: (Array.isArray(normalized.portfolioProjects) ? normalized.portfolioProjects : [])
        .map(sanitizePortfolioProject)
        .filter(function (project) {
          return project.id;
        }),
      plans: (Array.isArray(normalized.plans) ? normalized.plans : [])
        .map(sanitizePlan)
        .filter(function (plan) {
          return plan.id;
        }),
      updatedAt: safeString(normalized.updatedAt) || new Date().toISOString()
    };
  }

  function notify(data) {
    if (typeof window.CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("teq-content-store:change", { detail: clone(data) }));
    }
  }

  function readRaw() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeRaw(data) {
    var payload = sanitizeData(data);
    payload.updatedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    notify(payload);
    return clone(payload);
  }

  function getData() {
    var stored = readRaw();
    if (!stored) {
      return writeRaw(defaultData);
    }
    return sanitizeData(stored);
  }

  function saveData(data) {
    return writeRaw(data);
  }

  function resetData() {
    return writeRaw(defaultData);
  }

  function getPortfolioProjects() {
    return getData().portfolioProjects;
  }

  function getPlans() {
    return getData().plans;
  }

  window.TEQContentStore = {
    storageKey: STORAGE_KEY,
    defaultData: clone(defaultData),
    getData: getData,
    saveData: saveData,
    resetData: resetData,
    getPortfolioProjects: getPortfolioProjects,
    getPlans: getPlans
  };
})(window);
