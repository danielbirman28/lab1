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
                url: 'https://github.com/danielbirman28/lab1/commit/' + commit,
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

let xScale, yScale; // Declare global variables
function createScatterplot() {
    const width = 1000;
    const height = 600;

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3.scaleTime().domain(d3.extent(commits, (d) => d.datetime)).range([0, width]).nice();
    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const sort1 = commits.filter((commit) => commit.id != 'fed6237f')
    const dots = svg.append('g').attr('class', 'dots');
    const [minLines, maxLines] = d3.extent(sort1, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]); // adjust these values based on your experimentation
    
    const sortedCommits = d3.sort(sort1, (d) => -d.totalLines);

    dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', function (event, d) {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        updateTooltipContent(d);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
    })
    .on('mouseleave', function () {
        d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
        updateTooltipContent({});
        updateTooltipVisibility(false);
    });


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
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d/%y'));
    // const yAxis = d3.axisLeft(yScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    const xAxisGroup = svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Rotate x-axis labels for better readability
    xAxisGroup
    .selectAll('text')
    .attr('text-anchor', 'end')  // Align text to the end
    .attr('transform', 'rotate(-45)')  // Rotate labels
    .attr('dy', '0.5em')  // Adjust vertical spacing
    .attr('dx', '-0.5em')  // Adjust horizontal spacing
    .attr('font-size','10px');

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

    dots.on('mouseenter', (event, commit) => {
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      });

      brushSelector()
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterplot();
});

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
    time.textContent = commit.datetime?.toLocaleTimeString('en', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}


function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

function brushSelector() {
    const svg = document.querySelector('svg');
    // Create brush
    d3.select(svg).call(d3.brush());

    // Raise dots and everything after overlay
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

    // Update brush initialization to listen for events
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
}

let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
    if (!brushSelection) return false;
  
    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  
    const x = xScale(commit.date);
    const y = yScale(commit.hourFrac);
  
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}  

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }

  function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }