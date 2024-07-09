const CONFIG = {
    AXIS_TRANSITION_TIME: 100
};

const ui = (() => {
    return {
        /* Navigation Elements */
        beginBtn: document.getElementById('begin-btn'),
        backBtn: document.getElementById('back-btn'),
        nextBtn: document.getElementById('next-btn'),
        progressIndicator: document.getElementById('progress-indicator'),
        /* Content Elements */
        header: document.getElementById('header'),
        intro: document.getElementById('intro'),
        content: document.getElementById('content'),
        /* Narrative Content */
        narrativeContents: document.querySelectorAll('.narrative-content'),
        progressSteps: document.querySelectorAll('.progress-step'),
        /* Chart Controls */
        scaleToggle: document.getElementById('scaleToggle'),
        mooresLawToggle: document.getElementById('mooresLawToggle'),
        mosfetScaleToggle: document.getElementById('mosfetScaleToggle')
    };
})();

const chart = {
    chartSvg: null,
    xScale: null,
    yScale: null,
    line: null,
    transistorData: null,
    mosfetScaleData: null
};

const state = {
    /* Toggles */
    isMooresLawVisible: false,
    isMosfetScaleVisible: false,
    isLogScale: true,
    /* Narrative Step */
    currentStep: 0,
    totalSteps: 0
};

let startYear = 1971;
let endYear = 2021;

const margin = {top: 20, right: 20, bottom: 50, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* Load data and hookup event listeners when the page first loads. */
document.addEventListener('DOMContentLoaded', async () => {

    // Set the initial UI state.
    initializeUI();

    // Initialize the chart (including loading the data asynchronously.)
    await initializeChart();

    updateChart();

    state.currentStep = 0;
    state.totalSteps = ui.narrativeContents.length;

    ui.beginBtn.addEventListener('click', function () {
        ui.header.classList.add('minimized');
        ui.content.classList.add('visible');
        ui.beginBtn.style.display = 'none';
        state.currentStep = 1;
        updateButtons();
        updateProgress();
        updateNarrative();
    });

    ui.backBtn.addEventListener('click', function () {
        if (state.currentStep > 1) {
            state.currentStep--;
            updateButtons();
            updateProgress();
            updateNarrative();
        } else if (state.currentStep > 0) {
            initializeUI();
            updateButtons();
            updateProgress();
            updateNarrative();
        }
    });

    ui.nextBtn.addEventListener('click', function () {
        if (state.currentStep < state.totalSteps) {
            state.currentStep++;
            updateButtons();
            updateProgress();
            updateNarrative();
        }
    });

    ui.progressSteps.forEach(step => {
        step.addEventListener('click', function () {
            const stepNumber = parseInt(this.getAttribute('data-step'));
            goToStep(stepNumber);
        });
    });

    if (ui.scaleToggle) {
        ui.scaleToggle.addEventListener('change', (event) => {
            state.isLogScale = event.target.checked;
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

    if (ui.mooresLawToggle) {
        ui.mooresLawToggle.addEventListener('change', (event) => {
            state.isMooresLawVisible = event.target.checked;
            updateChart(startYear, endYear);
        });
    } else {
        console.error("Moore's Law toggle element not found");
    }

    if (ui.mosfetScaleToggle) {
        ui.mosfetScaleToggle.addEventListener('change', (event) => {
            state.isMosfetScaleVisible = event.target.checked;
            updateChart(startYear, endYear);
        });
    } else {
        console.error("Mosfet scale toggle element not found");
    }
});

function initializeUI() {

    // Show only the Begin-button initially
    ui.beginBtn.style.display = 'inline-block';
    ui.backBtn.style.display = 'none';
    ui.nextBtn.style.display = 'none';
    ui.progressIndicator.style.display = 'none';

    ui.mooresLawToggle.checked = false;
    ui.scaleToggle.checked = true;
    ui.mosfetScaleToggle.checked = false;

    // Set initial step
    state.currentStep = 0;

    ui.header.classList.remove('minimized');
    ui.content.classList.remove('visible');

}

function goToStep(step) {
    if (step >= 1 && step <= state.totalSteps) {
        state.currentStep = step;
        updateButtons();
        updateProgress();
        updateNarrative();
    }
}

function updateButtons() {

    ui.intro.style.display = state.currentStep === 0 ? 'block' : 'none';
    ui.beginBtn.style.display = state.currentStep === 0 ? 'inline-block' : 'none';
    ui.backBtn.style.display = state.currentStep > 0 ? 'inline-block' : 'none';
    ui.progressIndicator.style.display = state.currentStep > 0 ? 'flex' : 'none';

    console.log(`Current Step: ${state.currentStep}, Total Steps: ${state.totalSteps}`);

    if (state.currentStep === 0) {
        ui.nextBtn.style.display = 'none';
    } else if (state.currentStep < state.totalSteps) {
        ui.nextBtn.style.display = 'inline-block';
        ui.nextBtn.disabled = false;
    } else {
        ui.nextBtn.disabled = true;
    }
}

function updateNarrative() {

    ui.narrativeContents.forEach(content => {
        content.classList.remove('active');
    });

    const activeContent = document.querySelector(`.narrative-content[data-step="${state.currentStep}"]`);

    if (activeContent) {
        activeContent.classList.add('active');
    }

    // Update chart based on current step
    updateChart(state.currentStep);
}

function updateProgress() {
    ui.progressSteps.forEach((step, index) => {
        if (index + 1 === state.currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function updateChart(step) {
    // Implement chart updates based on the current step
    // This will depend on your D3.js implementation
    switch (step) {
        case 1:
            // Show initial chart
            break;
        case 2:
            // Add Moore's Law line
            break;
        case 3:
            // Show manufacturing data
            break;
        case 4:
            // Enable all interactive features
            break;
    }
}

async function initializeChart() {

    // Set the dimensions and margins of the graph


    // Append the svg object to the #chart element.
    chart.chartSvg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load the data
    chart.transistorData = await d3.csv("data/transistors-per-microprocessor.csv");
    chart.mosfetScaleData = await d3.csv("data/mosfet-scaling.csv");

    // Parse the date and ensure proper scaling
    chart.transistorData.forEach(d => {
        d.Year = d3.timeParse("%Y")(d.Year);
        d.TransistorsPerMicroprocessor = +d["Transistors per microprocessor"];
    });

    // Set up scales
    chart.xScale = d3.scaleTime().range([0, width]);
    chart.yScale = d3.scaleLog().base(10).range([height, 0]);

    // Set up line generator
    chart.line = d3.line()
        .defined(d => !isNaN(d.TransistorsPerMicroprocessor))
        .x(d => chart.xScale(d.Year))
        .y(d => chart.yScale(d.TransistorsPerMicroprocessor));

    // Add axes
    chart.chartSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    chart.chartSvg.append("g")
        .attr("class", "y-axis");

    // Add grid lines
    chart.chartSvg.append("g")
        .attr("class", "grid x-grid")
        .attr("transform", `translate(0,${height})`);

    chart.chartSvg.append("g")
        .attr("class", "grid y-grid");

    // Add path for the line
    chart.chartSvg.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);
}

function updateChart(startYear = null, endYear = null) {

    if (!chart.transistorData || chart.transistorData.length === 0) {
        // Shouldn't happen if we handled the concurrency properly.
        console.warn("Data not loaded yet");
        return;
    }

    let filteredData = chart.transistorData;

    if (startYear !== null && endYear !== null) {
        const startDate = new Date(startYear, 0, 1);
        const endDate = new Date(endYear, 11, 31);
        filteredData = chart.transistorData.filter(d => d.Year >= startDate && d.Year <= endDate);
    }

    // Update scales
    const minTransistors = d3.min(filteredData, d => d.TransistorsPerMicroprocessor);
    const maxTransistors = d3.max(filteredData, d => d.TransistorsPerMicroprocessor);

    // Y scale adjusts to the nearest power of 10. (E.g. if minTransistors is 2800, the min scale should be 10^3 = 1000)
    const minY = Math.pow(10, Math.floor(Math.log10(minTransistors)));
    const maxY = Math.pow(10, Math.ceil(Math.log10(maxTransistors)));

    // X scale fits the data exactly.
    chart.xScale.domain(d3.extent(filteredData, d => d.Year));

    if (state.isLogScale) {
        chart.yScale = d3.scaleLog()
            .base(10)
            .domain([Math.pow(10, Math.floor(Math.log10(minTransistors))),
                Math.pow(10, Math.ceil(Math.log10(maxTransistors)))])
            .range([height, 0]);
    } else {
        chart.yScale = d3.scaleLinear()
            .domain([0, maxTransistors])
            .range([height, 0]);
    }

    // Update axes with transition
    chart.chartSvg.select(".x-axis")
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .call(d3.axisBottom(chart.xScale).ticks(10));

    chart.chartSvg.select(".y-axis")
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .call(d3.axisLeft(chart.yScale).ticks(5, "~s"));

    // Update grid lines
    const make_x_gridlines = () => d3.axisBottom(chart.xScale).ticks(10);
    const make_y_gridlines = () => d3.axisLeft(chart.yScale).ticks(5);

    chart.chartSvg.select(".x-grid")
        .attr("transform", `translate(0,${height})`)
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat(""));

    chart.chartSvg.select(".y-grid")
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat(""));

    // Update the line with transition
    chart.chartSvg.select(".line")
        .datum(filteredData)
        .transition().duration(CONFIG.AXIS_TRANSITION_TIME)
        .attr("d", chart.line);

    // Remove existing Moore's Law elements
    chart.chartSvg.select(".moores-law-area").remove();
    chart.chartSvg.select(".moores-law-line").remove();

    // Add Moore's Law visualization
    addMooresLaw(startYear, endYear);

    // Add Mosfet scale visualization
    addMosfetScaleBands(startYear, endYear);
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

function addMooresLaw(detailStartYear, detailEndYear) {

    if (!state.isMooresLawVisible) {
        chart.chartSvg.selectAll(".moores-law-area, .moores-law-line").remove();
        return;
    }

    // Remove existing Moore's Law elements
    chart.chartSvg.selectAll(".moores-law-area, .moores-law-line, #chart-area").remove();

    const years = chart.transistorData.map(d => d.Year.getFullYear());
    const startYear = Math.min(...years);
    const endYear = Math.max(...years);
    const initialTransistors = chart.transistorData[0].TransistorsPerMicroprocessor;

    console.log("Data range:", {startYear, endYear, initialTransistors});

    const mooresLawData = generateMooresLawData(startYear, endYear, initialTransistors);
    console.log("Moore's Law data points:", mooresLawData.length);

    // Create a clipping path
    chart.chartSvg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("x", chart.xScale(new Date(detailStartYear, 0, 1)))
        .attr("y", 0)
        .attr("width", chart.xScale(new Date(detailEndYear, 0, 1)) - chart.xScale(new Date(detailStartYear, 0, 1)))
        .attr("height", height);

    // Create a grey area for Moore's Law channel
    const area = d3.area()
        .x(d => chart.xScale(d.Year))
        .y0(d => chart.yScale(d.TransistorsPerMicroprocessor / 2))
        .y1(d => chart.yScale(d.TransistorsPerMicroprocessor * 2));

    chart.chartSvg.append("path")
        .datum(mooresLawData)
        .attr("class", "moores-law-area")
        .attr("clip-path", "url(#chart-area)")
        .attr("fill", "rgba(200, 200, 200, 0.3)")
        .attr("d", area);

    // Add Moore's Law line
    const mooresLawLine = d3.line()
        .x(d => chart.xScale(d.Year))
        .y(d => chart.yScale(d.TransistorsPerMicroprocessor));

    chart.chartSvg.append("path")
        .datum(mooresLawData)
        .attr("class", "moores-law-line")
        .attr("clip-path", "url(#chart-area)")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", mooresLawLine);
}

function addMosfetScaleBands(detailStartYear, detailEndYear) {
    // Filter the data based on the year range
    const filteredData = chart.mosfetScaleData.filter(d => d.Year >= detailStartYear && d.Year <= detailEndYear);

    const fullColorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(chart.mosfetScaleData.map((d, i) => i));

    // Remove existing bands and labels
    chart.chartSvg.selectAll(".process-node-band, .process-node-label").remove();

    if (!state.isMosfetScaleVisible) {
        return;
    }

    // Add bands
    const bands = chart.chartSvg.selectAll(".process-node-band")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "process-node-band")
        .attr("x", d => chart.xScale(new Date(d.Year, 0, 1)))
        .attr("width", (d, i, nodes) => {
            if (i === nodes.length - 1) {
                return Math.max(0, chart.xScale.range()[1] - chart.xScale(new Date(d.Year, 0, 1)));
            }
            return Math.max(0, chart.xScale(new Date(filteredData[i + 1].Year, 0, 1)) - chart.xScale(new Date(d.Year, 0, 1)));
        })
        .attr("y", 0)
        .attr("height", height)
        .attr("fill", d => fullColorScale(chart.mosfetScaleData.findIndex(item => item.Year === d.Year)));

    const labels = chart.chartSvg.selectAll(".process-node-label")
        .data(filteredData)
        .enter().append("text")
        .attr("class", "process-node-label")
        .attr("transform", (d, i) => {
            let x;
            if (i === filteredData.length - 1) {
                // For the last band, use the center between its start and the end of the chart
                x = (chart.xScale(new Date(d.Year, 0, 1)) + chart.xScale.range()[1]) / 2;
            } else {
                // For other bands, use the center between this band's start and the next band's start
                const nextYear = filteredData[i + 1].Year;
                x = (chart.xScale(new Date(d.Year, 0, 1)) + chart.xScale(new Date(nextYear, 0, 1))) / 2;
            }
            const y = 30;  // Adjust this value to move labels up or down
            return `translate(${x}, ${y}) rotate(-90)`;
        })
        .text(d => d.Process);
}