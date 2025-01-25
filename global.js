console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// // Step 2.1: Get all nav links
// const navLinks = $$("nav a"); // Assuming $$ is already defined

// // Step 2.2: Find the link to the current page
// const currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );

// // Step 2.3: Add the 'current' class
// currentLink?.classList.add("current");

// Step 3.1: Define pages for the navigation menu
let pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'cv/index.html', title: 'Resume' },
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