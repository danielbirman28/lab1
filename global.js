console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2.1: Get all nav links
const navLinks = $$("nav a"); // Assuming $$ is already defined

// Step 2.2: Find the link to the current page
const currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

// Step 2.3: Add the 'current' class
currentLink?.classList.add("current");
