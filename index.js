// Step 2.1.2
import { fetchJSON, renderProjects, fetchGitHubData} from './global.js';

// Step 2.1.3
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

// Step 2.1.4
const projectsContainer = document.querySelector('.projects');

// Step 2.1.5
renderProjects(latestProjects, projectsContainer, 'h2');

// Step 3.2.3
const githubData = await fetchGitHubData('danielbirman28');

// Step 4
const profileStats = document.querySelector('#profile-stats');

// Step 5
if (profileStats) {
    profileStats.innerHTML = `
      <h2>GitHub Profile Stats</h2>
      <dl style="display: grid; grid-template-columns: repeat(4, 1fr);">
        <dt style="grid-row: 1;">Public Repos:</dt><dd style="grid-row: 2;">${githubData.public_repos}</dd>
        <dt style="grid-row: 1;">Public Gists:</dt><dd style="grid-row: 2;">${githubData.public_gists}</dd>
        <dt style="grid-row: 1;">Followers:</dt><dd style="grid-row: 2;">${githubData.followers}</dd>
        <dt style="grid-row: 1;">Following:</dt><dd style="grid-row: 2;">${githubData.following}</dd>
      </dl>
    `;
  }
  