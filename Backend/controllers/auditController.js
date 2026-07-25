import { Octokit } from "octokit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Audit from "../models/Audit.js";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function getFileContent(owner, repo, path) {
  const response = await octokit.rest.repos.getContent({ owner, repo, path });
  return Buffer.from(response.data.content, "base64").toString("utf-8");
}

async function reviewCode(code, filename) {
  const prompt = `You are a senior code reviewer. Review the following code from file "${filename}" and respond ONLY with valid JSON (no markdown, no backticks, no extra text) in exactly this format:

{
  "qualityScore": <number 1-10>,
  "bugs": ["list of bugs found, empty array if none"],
  "badPractices": ["list of bad practices, empty array if none"],
  "suggestions": ["list of improvement suggestions"]
}

Code:
${code}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleanedText = rawText.replace(/```json|```/g, "").trim();

  return JSON.parse(cleanedText);
}

export const runAudit = async (req, res) => {
  try {
    const { owner, repo, filePath } = req.body;

    if (!owner || !repo || !filePath) {
      return res.status(400).json({ message: "owner, repo, and filePath are required" });
    }

    const code = await getFileContent(owner, repo, filePath);
    const review = await reviewCode(code, filePath);

    const auditRecord = await Audit.create({
      userId: req.userId,
      repoUrl: `${owner}/${repo}`,
      filePath,
      review,
      status: "success"
    });

    res.status(200).json(auditRecord);
  } catch (err) {
    res.status(500).json({ message: "Audit failed", error: err.message });
  }
};

export const getMyAudits = async (req, res) => {
  try {
    const audits = await Audit.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(audits);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};