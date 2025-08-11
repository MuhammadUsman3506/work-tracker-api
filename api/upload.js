// Vercel serverless function: api/upload.js
// Deploy this to Vercel. Set the environment variable GITHUB_TOKEN in Vercel project settings.
import fetch from "node-fetch";

export default async function handler(req, res) {
  // Allow CORS from anywhere (adjust in production if you want restricted origins)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename, contentBase64, commitMessage } = req.body || {};
    if (!filename || !contentBase64) {
      return res.status(400).json({ error: "Missing filename or contentBase64 in body" });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: "GITHUB_TOKEN not configured on server" });
    }

    const OWNER = "MuhammadUsman3506";
    const REPO = "Work-tracker";
    const PATH = filename.replace(/^\/+/, ""); // sanitize

    const githubRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "work-tracker-uploader"
      },
      body: JSON.stringify({
        message: commitMessage || `Add ${PATH}`,
        content: contentBase64
      })
    });

    const result = await githubRes.json();
    if (!githubRes.ok) {
      return res.status(githubRes.status).json({ error: result.message || "GitHub API error", details: result });
    }

    return res.status(200).json({ success: true, fileUrl: result.content.html_url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
