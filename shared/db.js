import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "content", "portfolio.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (_) {
    const seed = { portfolioProjects: [], updatedAt: new Date().toISOString() };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

function normalizeProject(p) {
  return {
    id: p.id || `portfolio-${Math.random().toString(36).slice(2, 8)}`,
    title: p.title || "Untitled",
    description: p.description || "",
    category: p.category || "",
    location: p.location || "",
    year: p.year || "",
    priceLabel: p.priceLabel || "",
    image: p.image || p.imageUrl || ""
  };
}

export async function getProjects() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const json = JSON.parse(raw || "{}");
  const projects = Array.isArray(json.portfolioProjects) ? json.portfolioProjects : [];
  return projects.map(normalizeProject);
}

export async function saveProjects(projects) {
  await ensureDataFile();
  const normalized = projects.map(normalizeProject);
  const payload = {
    portfolioProjects: normalized,
    updatedAt: new Date().toISOString()
  };
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
  return normalized;
}

export async function addProject(project) {
  const projects = await getProjects();
  const next = [...projects, normalizeProject(project)];
  return saveProjects(next);
}

export async function updateProject(id, data) {
  const projects = await getProjects();
  const next = projects.map((p) => (p.id === id ? { ...p, ...normalizeProject({ ...p, ...data, id }) } : p));
  return saveProjects(next);
}

export async function deleteProject(id) {
  const projects = await getProjects();
  const next = projects.filter((p) => p.id !== id);
  return saveProjects(next);
}
