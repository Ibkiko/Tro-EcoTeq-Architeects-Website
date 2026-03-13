import { addProject, deleteProject, getProjects, saveProjects, updateProject } from "../../shared/db";

function getAuthSecret(req) {
  const token =
    (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, "")) ||
    req.headers["x-admin-secret"] ||
    (typeof req.body === "object" && req.body ? req.body.secret : null);
  return token || "";
}

function requireAuth(req, res) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return true; // optional: allow if not set
  if (getAuthSecret(req) !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    try {
      const projects = await getProjects();
      return res.status(200).json({ projects });
    } catch (err) {
      return res.status(500).json({ error: err.message || "Failed to load projects" });
    }
  }

  // Mutations below this point require auth
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === "POST") {
      const project = req.body || {};
      const projects = await addProject(project);
      return res.status(201).json({ projects });
    }

    if (req.method === "PUT") {
      const { id, ...data } = req.body || {};
      if (!id) return res.status(400).json({ error: "Missing project id" });
      const projects = await updateProject(id, data);
      return res.status(200).json({ projects });
    }

    if (req.method === "DELETE") {
      const { id } = req.body || req.query;
      if (!id) return res.status(400).json({ error: "Missing project id" });
      const projects = await deleteProject(id);
      return res.status(200).json({ projects });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to save projects" });
  }
}
