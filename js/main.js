
async function initializeChart() {
    // Delete previous SVG if it exists
    d3.select("#chart").select("svg").remove();

    // Set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 50, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select("#chart").append("svg")
        .attr("width",  width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${margin.left},${margin.top})`);

    // Load the data
    const data = await d3.csv("data/cpu_performance_trend.csv");

    // List of groups = header of the csv files = soil condition here
    // var keys = ["rel_transistors", "rel_max_clock", "rel_tdp", "rel_perf", "rel_perfnorm"]
    var keys = ["rel_transistors"]

    // Color palette for lines
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet2);

    // Add X axis
    var x = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d3.timeParse("%Y-%m-%d")(d.date); }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5));

    console.log(data.length);

    // Add Y axis
    var y = d3.scaleLog().base(10)
        .domain([1, 10 * d3.max(data, function (d) { return +d[keys[0]]; })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5));

    // Draw the lines
    var line = d3.line()
        //.defined(d => !isNaN(d))
        .x(d => x(d.date))
        .y(d => y(d.value))

    // Create a group for each data series in 'keys', append a path for the line chart and a label for the legend
    keys.forEach(function (key) {
        let datalist = data.map(function (d) {
            return {
                date: d3.timeParse("%Y-%m-%d")(d.date),
                value: d[key]
            }
        }).filter(d => !isNaN(d.value));

        console.log('Datalist length: ', datalist.length);   // print datalist length
        console.log('Datalist sample: ', datalist.slice(0, 50));

        svg.append("path")
            .datum(datalist)
            .attr("fill", "none")
            .attr("stroke", color(key))
            .attr("stroke-width", 2.5)
            .attr("d", line)

        // svg.append("text")
        //     .datum(datalist[datalist.length - 1]) // select last value of each time series
        //     .attr("transform", d => `translate(${x(d.date)},${y(d.value)})`) // Compute the x and y position of the last value
        //     .attr("x", 12) // shift the text a bit more right
        //     .text(key)
        //     .style("fill", color(key));
    })
}

// Call the function when the page has fully loaded
document.addEventListener('DOMContentLoaded', initializeChart);


function initializeChart_() {

    // Remove the existing chart.
    d3.select("#chart").select("svg").remove();

    // Set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 20, left: 40},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Some data
    var data = [12, 19, 3, 5, 2, 3];

    // X scale and X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(["a", "b", "c", "d", "e", "f"])
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));


    // Y scale and Y axis
    var y = d3.scaleLinear()
        .domain([0, 20])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    //Bars
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) { return x("abcdef"[i]); })
        .attr("y", function(d) { return y(d); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d); })
        .attr("fill", "#69b3a2")
}

// Call the function when the page has fully loaded
document.addEventListener('DOMContentLoaded', initializeChart);