const CONFIG = {
    AXIS_TRANSITION_TIME: 100
};

/* All of the UI elements (except for the chart elements.)  */
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
        mosfetScaleToggle: document.getElementById('mosfetScaleToggle'),
        cpuToggle: document.getElementById('cpuToggle'),
        /* Citations */
        citationsIcon: document.getElementById('citations-icon'),
        citationsPopup: document.getElementById('citations-popup')
    };
})();

/* Chart elements. */
const chart = {
    chartSvg: null,
    xScale: null,
    yScale: null,
    line: null,
    transistorData: null,
    mosfetScaleData: null,
    cpuData: null,
    dateRangeSlider: null
};

/* Toggle and scene state. */
const state = {
    /* Narrative Step */
    currentScene: 0,
    sceneCount: 0,
    /* Animation states (so we can cancel them if needed.) */
    cancelYearAnimation: null,
    cancelMooresLawAnimation: null
};

let startYear = 1971;
let endYear = 2021;

const margin = {top: 20, right: 20, bottom: 50, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* Load data and hookup event listeners when the page first loads. */
document.addEventListener('DOMContentLoaded', async () => {

    // Set the initial UI state.
    displayScene(0);

    // Initialize the chart (including loading the data asynchronously.)
    await initializeChart();

    updateChart();

    state.currentScene = 0;
    state.sceneCount = ui.narrativeContents.length;

    ui.beginBtn.addEventListener('click', function () {
        displayScene(Math.min(state.sceneCount, state.currentScene + 1));
    });

    ui.backBtn.addEventListener('click', function () {
        displayScene(Math.max(0, state.currentScene - 1));
    });

    ui.nextBtn.addEventListener('click', function () {
        displayScene(Math.min(state.sceneCount, state.currentScene + 1));
    });

    ui.progressSteps.forEach(step => {
        step.addEventListener('click', function () {
            const stepNumber = parseInt(this.getAttribute('data-step'));
            displayScene(stepNumber);
        });
    });

    chart.dateRangeSlider = createDateRangeSlider('#date_range', 1971, 2021, (newStartYear, newEndYear) => {
        startYear = newStartYear;
        endYear = newEndYear;
        updateChart();
    });

    if (ui.scaleToggle) {
        ui.scaleToggle.addEventListener('change', () => {
            updateChart();
        });
    } else {
        console.error("Scale toggle element not found");
    }

    if (ui.mooresLawToggle) {
        ui.mooresLawToggle.addEventListener('change', () => {
            updateChart();
        });
    } else {
        console.error("Moore's Law toggle element not found");
    }

    if (ui.cpuToggle) {
        ui.cpuToggle.addEventListener('change', () => {
            updateChart();
        });
    } else {
        console.error("Moore's Law toggle element not found");
    }

    if (ui.mosfetScaleToggle) {
        ui.mosfetScaleToggle.addEventListener('change', () => {
            updateChart();
        });
    } else {
        console.error("Mosfet scale toggle element not found");
    }
});

/* Toggles the citations popup. */
function toggleCitations() {
    ui.citationsPopup.classList.toggle('hidden');
}

/* Updates the UI to represent the specified scene. */
function displayScene(scene) {

    // If a scene was specified, set the current scene to it.
    if (scene != null) state.currentScene = scene;

    // Cancel any in-progress animations.
    if (state.cancelYearAnimation) {
        state.cancelYearAnimation();
        state.cancelYearAnimation = null;
    }

    if (state.cancelMooresLawAnimation) {
        state.cancelMooresLawAnimation();
        state.cancelMooresLawAnimation = null;
    }

    ui.intro.style.display = state.currentScene === 0 ? 'block' : 'none';

    // Update the navigation buttons.
    ui.beginBtn.style.display = state.currentScene === 0 ? 'inline-block' : 'none';
    ui.backBtn.style.display = state.currentScene > 0 ? 'inline-block' : 'none';
    if (state.currentScene === 0) {
        ui.nextBtn.style.display = 'none';
    } else if (state.currentScene < state.sceneCount) {
        ui.nextBtn.style.display = 'inline-block';
        ui.nextBtn.disabled = false;
    } else {
        ui.nextBtn.disabled = true;
    }
    ui.progressIndicator.style.display = state.currentScene > 0 ? 'flex' : 'none';

    // Update the citation UI positions.
    ui.citationsIcon.style.bottom = state.currentScene === 0 ? '20px' : '85px';
    ui.citationsPopup.style.bottom = state.currentScene === 0 ? '80px' : '145px';

    // Scene-specific set up.
    switch (state.currentScene) {
        case 0:
            /* The welcome scene. */

            // Set toggle states.
            ui.scaleToggle.checked = true;
            ui.mooresLawToggle.checked = false;
            ui.cpuToggle.checked = true;
            ui.mosfetScaleToggle.checked = false;

            // Display the header, hide the main content.
            ui.header.classList.remove('minimized');
            ui.content.classList.remove('visible');

            // Position the citations button near the window bottom.
            ui.citationsIcon.bottom = '60px';
            break;
        case 1:
            /* Scene 1 - Overview of transistor count over time graph. */

            // Display the header, hide the main content.
            ui.header.classList.add('minimized');
            ui.content.classList.add('visible');

            // Set toggle states.
            ui.scaleToggle.checked = true;
            ui.mooresLawToggle.checked = false;
            ui.cpuToggle.checked = true;
            ui.mosfetScaleToggle.checked = false;

            // Animate the end year slider moving min to max over a few seconds.
            state.cancelYearAnimation = animateYearSlider(1971, 2021, 20000);

            break;
        case 2:
            /* Scene 2 - Visualizing Moore's Law. */

            // Set toggle states.
            ui.scaleToggle.checked = true;
            ui.mooresLawToggle.checked = true;
            ui.cpuToggle.checked = false;
            ui.mosfetScaleToggle.checked = false;

            // Animate Moore's Law underlay.
            state.cancelMooresLawAnimation = animateMooresLaw(1971, 2021, 15000);

            break;
        case 3:
            /* Scene 3 - Visualizing the process scale that allowed scientists to adhere to Moore's Law. */

            // Set toggle states.
            ui.scaleToggle.checked = true;
            ui.mooresLawToggle.checked = false;
            ui.cpuToggle.checked = false;
            ui.mosfetScaleToggle.checked = true;

            break;
        case 4:
            /* Scene 4 - Interactive. */

            // Set toggle states.
            ui.scaleToggle.checked = true;
            ui.mooresLawToggle.checked = false;
            ui.cpuToggle.checked = true;
            ui.mosfetScaleToggle.checked = false;

            break;
        default:
            console.error(`displayScene(${scene}), invalid scene number.`)
            break;
    }

    if (state.currentScene >= 1 && state.currentScene <= state.sceneCount) {

        // Update the progress buttons.
        ui.progressSteps.forEach((step, index) => {
            if (index + 1 === state.currentScene) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update the narrative.
        ui.narrativeContents.forEach(content => {
            content.classList.remove('active');
        });

        const activeContent = document.querySelector(`.narrative-content[data-step="${state.currentScene}"]`);

        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Update the chart.
        updateChart();
    }
}

/* One-time initialization of the chart. (Includes loading the data asynchronously.) */
async function initializeChart() {

    // Append the svg object to the #chart element.
    chart.chartSvg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load the data
    chart.transistorData = await d3.csv("data/transistors-per-microprocessor.csv");
    chart.mosfetScaleData = await d3.csv("data/mosfet-scaling.csv");
    chart.cpuData = await d3.csv("data/cpus-cleaned.csv");

    // Pre-process the transistor data (parse date, etc.)
    chart.transistorData.forEach(d => {
        d.Year = d3.timeParse("%Y")(d.Year);
        d.TransistorsPerMicroprocessor = +d["Transistors per microprocessor"];
    });

    // Pre-process the CPU data (parse date, etc.)
    chart.cpuData.forEach((d, index) => {
        const parsedYear = d3.timeParse("%Y")(d.Year);
        d.Year = parsedYear;
        d.Process = parseFloat(d.Process.replace(/,/g, ''));
        d.TransistorCount = parseFloat(d.TransistorCount.replace(/,/g, ''));
        d.Show = d.Show === "1";
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

    chart.chartSvg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Year");

    chart.chartSvg.append("g")
        .attr("class", "y-axis");

    chart.chartSvg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Transistor Count (Log Scale)");

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

function updateChart() {

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

    if (ui.scaleToggle.checked) {
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

    chart.chartSvg.select(".y-axis-label")
        .text(ui.scaleToggle.checked ? "Transistor Count (Log Scale)" : "Transistor Count");

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

    // Add CPU annotations
    addCPUAnnotations();
}

function addCPUAnnotations() {

    // Remove existing annotations
    chart.chartSvg.selectAll(".cpu-annotation").remove();

    if (!chart.cpuData || !ui.cpuToggle.checked) return;

    const filteredCPUData = chart.cpuData.filter(d =>
        d.Year instanceof Date &&
        !isNaN(d.Year.getTime()) &&
        d.Year >= new Date(startYear, 0, 1) &&
        d.Year <= new Date(endYear, 11, 31) &&
        !isNaN(d.TransistorCount) &&
        d.Show
    );

    const annotations = chart.chartSvg.selectAll(".cpu-annotation")
        .data(filteredCPUData)
        .enter().append("g")
        .attr("class", "cpu-annotation")
        .attr("transform", d => {
            const x = chart.xScale(d.Year);
            const y = chart.yScale(d.TransistorCount);
            if (isNaN(x) || isNaN(y)) {
                console.warn("Invalid data point:", d);
                return "translate(0,0)";
            }
            return `translate(${x},${y})`;
        });

    console.log("Number of annotations created:", annotations.size());

    // Add a line connecting to the main chart line
    annotations.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -30)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "2,2");

    // Add the CPU name
    annotations.append("text")
        .attr("x", 0)
        .attr("y", -35)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.Processor);
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
            handle.attr('cx', d => x(d.value));
            highlightedRange
                .attr('x', x(newStartYear))
                .attr('width', x(newEndYear) - x(newStartYear));
            labels
                .attr('x', d => x(d.value))
                .text(d => d.value);
            onRangeChange(newStartYear, newEndYear);
        }
    };
}

function animateYearSlider(startYear, endYear, duration) {
    const fps = 30;
    const frames = duration / 1000 * fps;
    const yearIncrement = (endYear - startYear) / frames;
    let currentFrame = 0;
    let animationFrameId;

    function updateSlider() {
        if (currentFrame <= frames) {
            const currentYear = Math.round(startYear + yearIncrement * currentFrame);
            chart.dateRangeSlider.updateRange(startYear, currentYear);
            updateChart();
            currentFrame++;
            //setTimeout(updateSlider, 1000 / fps);
            animationFrameId = requestAnimationFrame(updateSlider);
        }
    }

    animationFrameId = requestAnimationFrame(updateSlider);

    return function cancelAnimation() {
        if (animationFrameId) {
            // Cancel the animation.
            cancelAnimationFrame(animationFrameId);
            // Update the slider to the end.
            currentFrame = frames;
            updateSlider();
        }
    }
}

function animateMooresLaw(startYear, endYear, duration) {
    const fps = 30;
    const frames = duration / 1000 * fps;
    const yearIncrement = (endYear - startYear) / frames;
    let currentFrame = 0;
    let animationFrameId;

    function updateMooresLaw() {
        if (currentFrame <= frames) {
            const currentYear = Math.round(startYear + yearIncrement * currentFrame);
            addMooresLaw(startYear, currentYear);
            currentFrame++;
            animationFrameId = requestAnimationFrame(updateMooresLaw);
        }
    }

    animationFrameId = requestAnimationFrame(updateMooresLaw);

    // Return a function to cancel the animation
    return function cancelAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            currentFrame = frames;
            updateMooresLaw();
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

    if (!ui.mooresLawToggle.checked) {
        chart.chartSvg.selectAll(".moores-law-area, .moores-law-line, .moores-law-annotation").remove();
        return;
    }

    // Remove existing Moore's Law elements
    chart.chartSvg.selectAll(".moores-law-area, .moores-law-line, .moores-law-annotation, #chart-area").remove();

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

    // Add Moore's Law annotation
    const annotationDistance = 50; // Distance from the line, adjust as needed
    const startPoint = mooresLawData[0];
    const endPoint = mooresLawData[mooresLawData.length - 1];

    // Calculate angle of the line
    const dx = chart.xScale(endPoint.Year) - chart.xScale(startPoint.Year);
    const dy = chart.yScale(endPoint.TransistorsPerMicroprocessor) - chart.yScale(startPoint.TransistorsPerMicroprocessor);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    // Calculate midpoint of the line
    const midX = (chart.xScale(startPoint.Year) + chart.xScale(endPoint.Year)) / 2;
    const midY = (chart.yScale(startPoint.TransistorsPerMicroprocessor) + chart.yScale(endPoint.TransistorsPerMicroprocessor)) / 2;

    // Calculate offset perpendicular to the line
    const perpAngle = angle + 90;
    const offsetX = annotationDistance * Math.cos(perpAngle * Math.PI / 180);
    const offsetY = annotationDistance * Math.sin(perpAngle * Math.PI / 180);

    chart.chartSvg.append("text")
        .attr("class", "moores-law-annotation")
        .attr("x", midX + offsetX)
        .attr("y", midY - offsetY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .attr("fill", "grey")
        .attr("transform", `rotate(${angle}, ${midX + offsetX}, ${midY - offsetY})`)
        .text("Moore's Law");
}

function addMosfetScaleBands(detailStartYear, detailEndYear) {
    // Filter the data based on the year range
    const filteredData = chart.mosfetScaleData.filter(d => d.Year >= detailStartYear && d.Year <= detailEndYear);

    const fullColorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(chart.mosfetScaleData.map((d, i) => i));

    // Remove existing bands and labels
    chart.chartSvg.selectAll(".process-node-band, .process-node-label").remove();

    if (!ui.mosfetScaleToggle.checked) {
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