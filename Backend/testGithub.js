import { Octokit } from "octokit";
import 'dotenv/config';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getFileContent(owner, repo, path) {
  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  // File content comes back base64-encoded — decode it
  const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
  return decodedContent;
}

async function run() {
  const content = await getFileContent('facebook', 'react', 'package.json');
  console.log('--- FILE CONTENT ---');
  console.log(content);
}

run();