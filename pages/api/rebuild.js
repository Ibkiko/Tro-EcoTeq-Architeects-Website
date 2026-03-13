export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!deployHookUrl) {
    return res.status(500).json({ error: "Deploy hook URL is not configured" });
  }

  const incomingSecret =
    (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, "")) ||
    req.headers["x-admin-secret"] ||
    (typeof req.body === "object" && req.body ? req.body.secret : null);

  if (adminSecret && adminSecret !== incomingSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const hookResponse = await fetch(deployHookUrl, { method: "POST" });
    const text = await hookResponse.text();

    if (!hookResponse.ok) {
      return res
        .status(502)
        .json({ error: "Deploy hook call failed", status: hookResponse.status, body: text });
    }

    return res.status(200).json({ ok: true, status: hookResponse.status, body: text || "ok" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Deploy hook call failed" });
  }
}
