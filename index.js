// Step 2.1.2
import { fetchJSON, renderProjects, fetchGithubData } from './global.js';

// Step 2.1.3
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

// Step 2.1.4
const projectsContainer = document.querySelector('.projects');

// Step 2.1.5
renderProjects(latestProjects, projectsContainer, 'h2');