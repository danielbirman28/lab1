let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    processCommits();  // Ensure commits are processed AFTER data is loaded
    displayStats();    // Now display stats
}

function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;

            let ret = {
                id: commit,
                url: 'https://github.com/vis-society/lab-7/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
                hour: datetime.getHours(),
                day: datetime.getDay(),
            };

            Object.defineProperty(ret, 'lines', {
                value: lines,
                enumerable: false,
                configurable: true,
                writable: false,
            });

            return ret;
        });

    console.log('Processed commits:', commits); // Debugging to check commits
}

function getMostFrequent(arr) {
    if (arr.length === 0) return null;
    let frequencyMap = d3.rollup(arr, v => v.length, d => d);
    return Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1])[0][0];
}

function getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
}

function displayStats() {
    if (!commits.length) {
        console.warn("No commit data available!");
        return;
    }

    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').text('Total Lines of Code');
    dl.append('dd').text(data.length);

    dl.append('dt').text('Total Commits');
    dl.append('dd').text(commits.length);

    let numFiles = new Set(data.map(d => d.file)).size;
    dl.append('dt').text('Number of Files');
    dl.append('dd').text(numFiles);

    let avgLineLength = d3.mean(data, d => d.length);
    dl.append('dt').text('Average Line Length (characters)');
    dl.append('dd').text(avgLineLength ? avgLineLength.toFixed(2) : 'N/A');

    let mostCommonHour = getMostFrequent(commits.map(d => d.hour));
    let mostCommonTimeOfDay = mostCommonHour !== null ? getTimeOfDay(mostCommonHour) : 'N/A';
    dl.append('dt').text('Most Active Time of Day');
    dl.append('dd').text(mostCommonTimeOfDay);

    let mostCommonDay = getMostFrequent(commits.map(d => d.day));
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dl.append('dt').text('Most Active Day');
    dl.append('dd').text(mostCommonDay !== null ? days[mostCommonDay] : 'N/A');
}

function createScatterplot() {
    const width = 1000;
    const height = 600;

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const dots = svg.append('g').attr('class', 'dots');

    dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    // const yAxis = d3.axisLeft(yScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    gridlines.selectAll('line')
    .attr('class', d => {
        const hour = d; // Assuming d represents an hour from the yScale axis
        if (hour >= 5 && hour < 12) return 'grid-morning';
        if (hour >= 12 && hour < 17) return 'grid-afternoon';
        if (hour >= 17 && hour < 21) return 'grid-evening';
        return 'grid-night';
    });

}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterplot();
});