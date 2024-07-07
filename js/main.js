let chartSvg, xScale, yScale, line, transistorData, mosfetScaleData;
let isMooresLawVisible = true;
let isMosfetScaleVisible = true;
let isLogScale = true;

let startYear = 1971;
let endYear = 2021;

const CONFIG = {
    AXIS_TRANSITION_TIME: 1000
};

const margin = {top: 20, right: 20, bottom: 50, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Call the function when the page has fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    await initializeChart();
    updateChart();

    const scaleToggle = document.getElementById('scaleToggle');
    if (scaleToggle) {
        scaleToggle.addEventListener('change', (event) => {
            isLogScale = event.target.checked;
            updateChart(startYear, endYear);
        });
    } else {
        console.error("Scale toggle element not found");
    }

    createDateRangeSlider('#date_range', 1971, 2021, (newStartYear, newEndYear) => {
        startYear = newStartYear;
        endYear = newEndYear;
        updateChart(newStartYear, newEndYear);
    });

    const mooresLawToggle = document.getElementById('mooresLawToggle');
    if (mooresLawToggle) {
        mooresLawToggle.addEventListener('change', (event) => {
            isMooresLawVisible = event.target.checked;
            updateChart(startYear, endYear);
        });
    } else {
        console.error("Moore's Law toggle element not found");
    }

    const mosfetScaleToggle = document.getElementById('mosfetScaleToggle');
    if (mosfetScaleToggle) {
        mosfetScaleToggle.addEventListener('change', (event) => {
            isMosfetScaleVisible = event.target.checked;
            updateChart(startYear, endYear);
        });
    } else {
        console.error("Mosfet scale toggle element not found");
    }
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
    mosfetScaleData = await d3.csv("data/mosfet-scaling.csv");

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

    if (isLogScale) {
        yScale = d3.scaleLog()
            .base(10)
            .domain([Math.pow(10, Math.floor(Math.log10(minTransistors))),
                Math.pow(10, Math.ceil(Math.log10(maxTransistors)))])
            .range([height, 0]);
    } else {
        yScale = d3.scaleLinear()
            .domain([0, maxTransistors])
            .range([height, 0]);
    }

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

    // Remove existing Moore's Law elements
    chartSvg.select(".moores-law-area").remove();
    chartSvg.select(".moores-law-line").remove();

    // Add Moore's Law visualization
    addMooresLaw(startYear, endYear, isMooresLawVisible);

    // Add Mosfet scale visualization
    addMosfetScaleBands(startYear, endYear, isMosfetScaleVisible);
}

function createDateRangeSlider(containerSelector, initialStartYear, initialEndYear, onRangeChange) {

    startYear = initialStartYear;
    endYear = initialEndYear;

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
        .attr('class', 'date-slider')
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
            newValue = Math.min(handlesData[1].value - 1, Math.max(initialStartYear, newValue));
        } else {
            newValue = Math.max(handlesData[0].value + 1, Math.min(initialEndYear, newValue));
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

function generateMooresLawData(detailStartYear, detailEndYear, initialTransistors) {
    const data = [];
    for (let year = detailStartYear; year <= detailEndYear; year++) {
        const yearsElapsed = year - detailStartYear;
        const doublings = yearsElapsed / 2;
        const transistors = initialTransistors * Math.pow(2, doublings);
        data.push({Year: new Date(year, 0, 1), TransistorsPerMicroprocessor: transistors});
    }
    return data;
}

function addMooresLaw(detailStartYear, detailEndYear, visible = true) {

    if (!visible) {
        chartSvg.selectAll(".moores-law-area, .moores-law-line").remove();
        return;
    }

    // Remove existing Moore's Law elements
    chartSvg.selectAll(".moores-law-area, .moores-law-line, #chart-area").remove();

    const years = transistorData.map(d => d.Year.getFullYear());
    const startYear = Math.min(...years);
    const endYear = Math.max(...years);
    const initialTransistors = transistorData[0].TransistorsPerMicroprocessor;

    console.log("Data range:", {startYear, endYear, initialTransistors});

    const mooresLawData = generateMooresLawData(startYear, endYear, initialTransistors);
    console.log("Moore's Law data points:", mooresLawData.length);

    // Create a clipping path
    chartSvg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("x", xScale(new Date(detailStartYear, 0, 1)))
        .attr("y", 0)
        .attr("width", xScale(new Date(detailEndYear, 0, 1)) - xScale(new Date(detailStartYear, 0, 1)))
        .attr("height", height);

    // Create a grey area for Moore's Law channel
    const area = d3.area()
        .x(d => xScale(d.Year))
        .y0(d => yScale(d.TransistorsPerMicroprocessor / 2))
        .y1(d => yScale(d.TransistorsPerMicroprocessor * 2));

    chartSvg.append("path")
        .datum(mooresLawData)
        .attr("class", "moores-law-area")
        .attr("clip-path", "url(#chart-area)")
        .attr("fill", "rgba(200, 200, 200, 0.3)")
        .attr("d", area);

    // Add Moore's Law line
    const mooresLawLine = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.TransistorsPerMicroprocessor));

    chartSvg.append("path")
        .datum(mooresLawData)
        .attr("class", "moores-law-line")
        .attr("clip-path", "url(#chart-area)")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", mooresLawLine);
}

function addMosfetScaleBands(detailStartYear, detailEndYear, visible = true) {
    // Filter the data based on the year range
    const filteredData = mosfetScaleData.filter(d => d.Year >= detailStartYear && d.Year <= detailEndYear);

    const fullColorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(mosfetScaleData.map((d, i) => i));

    // Remove existing bands and labels
    chartSvg.selectAll(".process-node-band, .process-node-label").remove();

    if (!visible) {
        return;
    }

    // Add bands
    const bands = chartSvg.selectAll(".process-node-band")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "process-node-band")
        .attr("x", d => xScale(new Date(d.Year, 0, 1)))
        .attr("width", (d, i, nodes) => {
            if (i === nodes.length - 1) {
                return Math.max(0, xScale.range()[1] - xScale(new Date(d.Year, 0, 1)));
            }
            return Math.max(0, xScale(new Date(filteredData[i + 1].Year, 0, 1)) - xScale(new Date(d.Year, 0, 1)));
        })
        .attr("y", 0)
        .attr("height", height)
        .attr("fill", d => fullColorScale(mosfetScaleData.findIndex(item => item.Year === d.Year)));

    const labels = chartSvg.selectAll(".process-node-label")
        .data(filteredData)
        .enter().append("text")
        .attr("class", "process-node-label")
        .attr("transform", (d, i) => {
            let x;
            if (i === filteredData.length - 1) {
                // For the last band, use the center between its start and the end of the chart
                x = (xScale(new Date(d.Year, 0, 1)) + xScale.range()[1]) / 2;
            } else {
                // For other bands, use the center between this band's start and the next band's start
                const nextYear = filteredData[i + 1].Year;
                x = (xScale(new Date(d.Year, 0, 1)) + xScale(new Date(nextYear, 0, 1))) / 2;
            }
            const y = 30;  // Adjust this value to move labels up or down
            return `translate(${x}, ${y}) rotate(-90)`;
        })
        .text(d => d.Process);
}