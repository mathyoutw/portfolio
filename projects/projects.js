import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";


const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedIndex = -1;
let newData = []; // ✅ Store global newData

function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(projectsGiven, (v) => v.length, (d) => d.year);
    newData = newRolledData.map(([year, count]) => ({ value: count, label: year })); // ✅ Update global newData

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));

    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();

    newArcs.forEach((arc, idx) => {
        d3.select('svg')
            .append('path')
            .attr('d', arc)
            .attr('fill', colors(idx))
            .attr('class', 'wedge')
            .on('click', function() { // ✅ Click event inside renderPieChart()
                selectedIndex = selectedIndex === idx ? -1 : idx;

                d3.selectAll('.wedge')
                    .classed('selected', (_, i) => selectedIndex === i);

                d3.selectAll('.legend-obj')
                    .classed('selected', (_, i) => selectedIndex === i);

                if (selectedIndex === -1) {
                    renderProjects(projects, projectsContainer, 'h2');
                } else {
                    let selectedYear = newData[selectedIndex].label;
                    let filteredProjects = projects.filter(project => project.year === selectedYear);
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                }
            });
    });

    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-obj')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// Call this function on page load
renderPieChart(projects);

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(event.target.value.toLowerCase());
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});