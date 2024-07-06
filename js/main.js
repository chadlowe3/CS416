let chartSvg, xScale, yScale, line, transistorData;

const CONFIG = {
    AXIS_TRANSITION_TIME: 50
};

const margin = {top: 20, right: 20, bottom: 50, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Call the function when the page has fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    await initializeChart();
    updateChart();

    createDateRangeSlider('#date_range', 1971, 2021, (startYear, endYear) => {
        updateChart(startYear, endYear);
    });
});

async function initializeChart() {

    // Set the dimensions and margins of the graph


    // Append the svg object to the #chart element.
    chartSvg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load the data
    transistorData = await d3.csv("data/transistors-per-microprocessor.csv");

    // Parse the date and ensure proper scaling
    transistorData.forEach(d => {
        d.Year = d3.timeParse("%Y")(d.Year);
        d.TransistorsPerMicroprocessor = +d["Transistors per microprocessor"];
    });

    // Set up scales
    xScale = d3.scaleTime().range([0, width]);
    yScale = d3.scaleLog().base(10).range([height, 0]);

    // Set up line generator
    line = d3.line()
        .defined(d => !isNaN(d.TransistorsPerMicroprocessor))
        .x(d => xScale(d.Year))
        .y(d => yScale(d.TransistorsPerMicroprocessor));

    // Add axes
    chartSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    chartSvg.append("g")
        .attr("class", "y-axis");

    // Add grid lines
    chartSvg.append("g")
        .attr("class", "grid x-grid")
        .attr("transform", `translate(0,${height})`);

    chartSvg.append("g")
        .attr("class", "grid y-grid");

    // Add path for the line
    chartSvg.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);

    // Initial update
    updateChart();
}

function updateChart(startYear = null, endYear = null) {

    if (!transistorData || transistorData.length === 0) {
        // Shouldn't happen if we handled the concurrency properly.
        console.warn("Data not loaded yet");
        return;
    }

    let filteredData = transistorData;

    if (startYear !== null && endYear !== null) {
        const startDate = new Date(startYear, 0, 1);
        const endDate = new Date(endYear, 11, 31);
        filteredData = transistorData.filter(d => d.Year >= startDate && d.Year <= endDate);
    }

    // Update scales
    const minTransistors = d3.min(filteredData, d => d.TransistorsPerMicroprocessor);
    const maxTransistors = d3.max(filteredData, d => d.TransistorsPerMicroprocessor);

    // Y scale adjusts to the nearest power of 10. (E.g. if minTransistors is 2800, the min scale should be 10^3 = 1000)
    const minY = Math.pow(10, Math.floor(Math.log10(minTransistors)));
    const maxY = Math.pow(10, Math.ceil(Math.log10(maxTransistors)));

    // X scale fits the data exactly.
    xScale.domain(d3.extent(filteredData, d => d.Year));
    yScale.domain([minY, maxY]);

    // Update axes with transition
    chartSvg.select(".x-axis")
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .call(d3.axisBottom(xScale).ticks(10));

    chartSvg.select(".y-axis")
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .call(d3.axisLeft(yScale).ticks(5, "~s"));

    // Update grid lines
    const make_x_gridlines = () => d3.axisBottom(xScale).ticks(10);
    const make_y_gridlines = () => d3.axisLeft(yScale).ticks(5);

    chartSvg.select(".x-grid")
        .attr("transform", `translate(0,${height})`)
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat(""));

    chartSvg.select(".y-grid")
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat(""));

    // Update the line with transition
    chartSvg.select(".line")
        .datum(filteredData)
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .attr("d", line);
}

function createDateRangeSlider(containerSelector, initialStartYear, initialEndYear, onRangeChange) {
    const startYear = initialStartYear;
    const endYear = initialEndYear;

    const svg = d3.select(containerSelector).append('svg')
        .attr('width', 500)
        .attr('height', 100);

    const margin = {top: 20, right: 30, bottom: 20, left: 30},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    const x = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([0, width]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const slider = g.append('g')
        .attr('class', 'slider')
        .attr('transform', `translate(0,${height / 2})`);

    slider.append('line')
        .attr('class', 'track')
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        });

    const highlightedRange = slider.append('rect')
        .attr('class', 'highlighted-range')
        .attr('x', x(startYear))
        .attr('width', x(endYear) - x(startYear))
        .attr('y', -5)
        .attr('height', 10)
        .attr('fill', '#007bff');

    const handlesData = [{id: 'min', value: startYear}, {id: 'max', value: endYear}];

    const labels = slider.selectAll('text.label')
        .data(handlesData)
        .enter().append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.value))
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .text(d => d.value);

    const handle = slider.selectAll('circle.handle')
        .data(handlesData)
        .enter().append('circle')
        .classed('handle', true)
        .attr('r', 9)
        .attr('cx', d => x(d.value))
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));

    function dragStarted(event, d) {
        d3.select(this).raise().attr('stroke-opacity', 1);
    }

    function dragged(event, d) {
        let newValue = Math.round(x.invert(event.x));
        if (d.id === 'min') {
            newValue = Math.min(handlesData[1].value - 1, Math.max(startYear, newValue));
        } else {
            newValue = Math.max(handlesData[0].value + 1, Math.min(endYear, newValue));
        }
        d.value = newValue;
        d3.select(this).attr('cx', x(newValue));
        updateHighlightedRange();
    }

    function dragEnded(event) {
        d3.select(this).attr('stroke-opacity', 0.5);
    }

    function updateHighlightedRange() {
        highlightedRange
            .attr('x', x(handlesData[0].value))
            .attr('width', x(handlesData[1].value) - x(handlesData[0].value));
        labels
            .attr('x', d => x(d.value))
            .text(d => d.value);
        onRangeChange(handlesData[0].value, handlesData[1].value);
    }

    updateHighlightedRange();

    return {
        updateRange: function (newStartYear, newEndYear) {
            handlesData[0].value = newStartYear;
            handlesData[1].value = newEndYear;
            updateHighlightedRange();
        }
    };
}