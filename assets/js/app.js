const svgWidth = 960
const svgHeight = 500

let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// View selection - changing this triggers transition
let currentSelection = "healthcare"

/**
 * Returns a updated scale based on the current selection.
 **/
function xScale(dataSet, currentSelection) {
  let xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataSet.map(d => parseInt(d[currentSelection]))) * 0.8,
      d3.max(dataSet.map(d => parseInt(d[currentSelection]))) * 1.2
    ])
    .range([0, width])

  return xLinearScale
}

/**
 * Returns and appends an updated x-axis based on a scale.
 **/
function renderAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale)

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis)

  return xAxis
}

/**
 * Returns and appends an updated circles group based on a new scale and the currect selection.
 **/
function renderCircles(circlesGroup, newXScale, currentSelection) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[currentSelection]))

  return circlesGroup
}

(function() {
  d3.csv("assets/data/data.csv").then(dataSet => {
    let xLinearScale = xScale(dataSet, currentSelection)
    let yLinearScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataSet.map(d => parseInt(d.poverty)))])
      .range([height, 0])

    let bottomAxis = d3.axisBottom(xLinearScale)
    let leftAxis = d3.axisLeft(yLinearScale)

    let xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)

    chartGroup.append("g").call(leftAxis)

    let circlesGroup = chartGroup
      .selectAll("circle")
      .data(dataSet)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[currentSelection]))
      .attr("cy", d => yLinearScale(d.poverty))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".5")

    let labelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`)

    labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "healthcare")
      .classed("active", true)
      .text("US Healthcare Costs")

    labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("US Obesity")

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("US Poverty")

    // Crate an event listener to call the update functions when a label is clicked
    labelsGroup.selectAll("text").on("click", function() {
      let value = d3.select(this).attr("value")
      if (value !== currentSelection) {
        currentSelection = value
        xLinearScale = xScale(dataSet, currentSelection)
        xAxis = renderAxes(xLinearScale, xAxis)
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          currentSelection
        )
      }
    })
  })
})()
