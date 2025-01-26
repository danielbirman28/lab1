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

// console.log('IT’S ALIVE!');
// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// // Theme handling code remains here
// if ('colorScheme' in localStorage) {
//   const savedColorScheme = localStorage.colorScheme;
//   document.documentElement.style.setProperty('color-scheme', savedColorScheme);
// }

// document.body.insertAdjacentHTML(
//   'afterbegin',
//   `<label class="color-scheme">
//       Theme:
//       <select id="theme-selector">
//           <option value="light">Light</option>
//           <option value="dark">Dark</option>
//           <option value="automatic">Automatic</option>
//       </select>
//   </label>`
// );

// const select = document.querySelector('.color-scheme select');
// select.addEventListener('input', function (event) {
//   const newColorScheme = event.target.value;
//   document.documentElement.style.setProperty('color-scheme', newColorScheme);
//   localStorage.colorScheme = newColorScheme;
//   console.log('Color scheme changed to:', newColorScheme);
// });

// // Navigation code starts here
// const ARE_WE_HOME = document.documentElement.classList.contains('home');

// let pages = [
//     { url: '', title: 'Home' },
//     { url: 'projects/', title: 'Projects' },
//     { url: 'contact/', title: 'Contact' },
//     { url: 'CV/', title: 'CV'},
//     { url: 'https://github.com/arshia-vadhani', title: 'Github', external: true }
// ];

// let nav = document.createElement('nav');
// document.body.prepend(nav);

// for (let p of pages) {
//   let url = p.url;
//   let title = p.title;
//   
//   url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
//   
//   let a = document.createElement('a');
//   a.href = url;
//   a.textContent = title;
//   a.classList.toggle(
//     'current',
//     a.host === location.host && a.pathname === location.pathname
//   );
//   if (p.external) {
//     a.target = "_blank";
//     a.rel = "noopener noreferrer";
//   }
//   nav.append(a);
// }