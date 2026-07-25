import { Octokit } from "octokit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function getFileContent(owner, repo, path) {
  const response = await octokit.rest.repos.getContent({ owner, repo, path });
  return Buffer.from(response.data.content, 'base64').toString('utf-8');
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
  const cleanedText = rawText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error(`Failed to parse AI response for ${filename}:`, cleanedText);
    return null;
  }
}

async function run() {
  const filesToAudit = [
    'packages/shared/objectIs.js',
    'packages/shared/shallowEqual.js',
    'packages/shared/hasOwnProperty.js',
  ];

  const results = [];

  for (const filePath of filesToAudit) {
    try {
      console.log(`\nFetching ${filePath}...`);
      const code = await getFileContent('facebook', 'react', filePath);

      console.log(`Reviewing ${filePath}...`);
      const review = await reviewCode(code, filePath);

      results.push({ file: filePath, review, status: 'success' });
    } catch (error) {
      console.error(`Skipping ${filePath} — ${error.message}`);
      results.push({ file: filePath, review: null, status: 'failed', error: error.message });
    }
  }

  console.log('\n--- ALL RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
}

run();