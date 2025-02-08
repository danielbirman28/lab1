// Step 1.4: Setting Up the projects.js File
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Select the container elements
let svg = d3.select("svg");
let legend = d3.select(".legend");

// Initialize selectedIndex to -1, indicating no wedge is selected initially
let selectedIndex = -1;

// Reconfirm that the search input is set up correctly
let searchInput = document.querySelector('.searchBar');
let query = '';

// Reattach the search input listener (check if it's missing)
searchInput.addEventListener('input', (event) => {
  query = event.target.value; // Get the value of the search input
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase()); // Check if search term exists
  });

  // Render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  
  // Re-render pie chart after filtering (optional)
  renderPieChart(filteredProjects);
});


function renderPieChart(projectsGiven) {
  // Recalculate rolled data based on filtered projects
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  // Map the rolled data to the desired structure
  let newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  // Recreate the pie chart slice generator
  let sliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = sliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let arcs = newArcData.map(d => arcGenerator(d));

  // Clear the previous SVG paths and legend before re-rendering
  svg.selectAll("path").remove();
  legend.selectAll("li").remove();

  // Generate the new pie chart paths
 // Generate the new pie chart paths
let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, index) => {
  svg.append("path")
    .attr("d", arc)
    .attr("fill", colors(index)) // Color each slice
    .style("cursor", "pointer") // Indicate interactivity
    .on('click', () => {
      if (selectedIndex === index) {
        // Deselect the wedge if already selected
        selectedIndex = -1;
        svg.selectAll("path").attr("fill", (d, i) => colors(i));
        legend.selectAll(".legend-item").classed("selected", false);
        
        // Reset and render all projects
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        // Select the clicked wedge
        selectedIndex = index;
        svg.selectAll("path")
          .attr("fill", (d, i) => i === selectedIndex ? "hotpink" : colors(i));

        legend.selectAll("li")
          .attr("class", (_, idx) => idx === selectedIndex ? "legend-item selected" : "legend-item");

        // Filter projects based on selected year
        let selectedYear = newArcData[selectedIndex].data.label;
        let filteredProjects = projects.filter(project => project.year === selectedYear);

        // Render filtered projects
        renderProjects(filteredProjects, projectsContainer, 'h2');
      }
    });
});


  // Generate the new legend
  newArcData.forEach((d, index) => {
    let listItem = legend.append("li")
      .style("display", "flex")
      .style("align-items", "center")
      .style("gap", "10px")
      .attr("class", "legend-item")
      .style("margin-bottom", "10px");

    listItem.append("span")
      .style("width", "20px")
      .style("height", "20px")
      .style("background-color", colors(index))
      .style("border-radius", "50%")
      .style("display", "inline-block");

    listItem.append("span")
      .text(`${d.data.label} (${d.data.value})`);
  });
}

// Initial call to render the pie chart when the page loads
renderPieChart(projects);
