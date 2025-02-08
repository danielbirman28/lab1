console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 3.1: Define pages for the navigation menu
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'cv/', title: 'Resume' },
  { url: 'https://github.com/danielbirman28', title: 'GitHub' },
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create <nav> element and prepend to <body>
let nav = document.createElement('nav');
document.body.prepend(nav);

// Iterate over pages to create links
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust URLs for non-home pages
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  // Create <a> element
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  a.target = a.host !== location.host ? '_blank' : '';

  // Add the link to <nav>
  nav.append(a);
}

// Step 4.2: Adding HTML for the dark mode switch
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-selector">
      <option value="auto">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const themeSelector = document.getElementById('theme-selector');
const rootElement = document.documentElement;

// Step 4.4: Actually making it work
function setColorScheme(theme) {
  if (theme === 'auto') {
    rootElement.style.colorScheme = ''; // Use default (OS preference)
  } else {
    rootElement.style.colorScheme = theme;
  }
  // Save user preference to localStorage
  localStorage.setItem('colorScheme', theme);
}

// Step 4.5: Saving the user’s preference
const savedTheme = localStorage.getItem('colorScheme') || 'auto';
themeSelector.value = savedTheme;
setColorScheme(savedTheme);

themeSelector.addEventListener('change', (event) => {
  const selectedTheme = event.target.value;
  setColorScheme(selectedTheme);
});

// Step 1.2 Importing Project Data into the Projects Page
export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      console.log(response);
      const data = await response.json();
      return data; // Return the parsed JSON data
      

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

// Step 1.3: Creating a renderProjects Function
// export function renderProjects(projects, containerElement, headingLevel = 'h2') {
//   if (!containerElement || !(containerElement instanceof HTMLElement)) {
//     console.error("Invalid container element.");
//     return;
//   }

//   const titleElement = document.querySelector('.projects-title');
//   if (titleElement) {
//     titleElement.innerHTML = `${projects.length} Projects`;
//   }

//   projects.forEach(project => {
//     const article = document.createElement('article');

//     // Create a container for description and year
//     const detailsDiv = document.createElement('div');
//     detailsDiv.innerHTML = `
//       <p>${project.description}</p>
//       <p class="project-year">${project.year}</p>
//     `;

//     article.innerHTML = `
//       <h3>${project.title}</h3>
//       <img src="${project.image}" alt="${project.title}">
//     `;

//     article.appendChild(detailsDiv); // Append details below the image
//     containerElement.appendChild(article);
//   });
// }

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement || !(containerElement instanceof HTMLElement)) {
    console.error("Invalid container element.");
    return;
  }

  // Clear the container before rendering new projects
  containerElement.innerHTML = '';

  const titleElement = document.querySelector('.projects-title');
  if (titleElement) {
    titleElement.innerHTML = `${projects.length} Projects`;
  }

  projects.forEach(project => {
    const article = document.createElement('article');

    // Create a container for description and year
    const detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = `
      <p>${project.description}</p>
      <p class="project-year">${project.year}</p>
    `;

    article.innerHTML = `
      <h3>${project.title}</h3>
      <img src="${project.image}" alt="${project.title}">
    `;

    article.appendChild(detailsDiv); // Append details below the image
    containerElement.appendChild(article);
  });
}



// Step 3.2.1, 3.2.2
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

