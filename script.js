document.addEventListener('DOMContentLoaded', () => {
// Fetch the data
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(response => response.json())
  .then(data => {
    createHeatMap(data);
  });

function createHeatMap(data) {
  // Extract the data
  const baseTemp = data.baseTemperature;
  const dataset = data.monthlyVariance;

  // Set dimensions and margins
  const margin = { top: 80, right: 60, bottom: 100, left: 100 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create scales
  const years = [...new Set(dataset.map(d => d.year))];
  const xScale = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(0);

  const yScale = d3.scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range([0, height])
    .padding(0);

  // Color scale
  const minTemp = d3.min(dataset, d => baseTemp + d.variance);
  const maxTemp = d3.max(dataset, d => baseTemp + d.variance);

  const colorScale = d3.scaleQuantize()
    .domain([minTemp, maxTemp])
    .range(['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
            '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']);

  // Create the SVG container
  const svg = d3.select('#heat-map')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Create x-axis
  const xAxis = d3.axisBottom(xScale)
    .tickValues(xScale.domain().filter(year => year % 10 === 0))
    .tickFormat(d => d);

  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  // Create y-axis with month names
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(month => monthNames[month]);

  svg.append('g')
    .attr('id', 'y-axis')
    .call(yAxis);

  // Create tooltip
  const tooltip = d3.select('#tooltip')
    .style('opacity', 0);

  // Create cells
  svg.selectAll('.cell')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', d => xScale(d.year))
    .attr('y', d => yScale(d.month - 1))
    .attr('width', xScale.bandwidth())
    .attr('height', yScale.bandwidth())
    .attr('data-month', d => d.month - 1)
    .attr('data-year', d => d.year)
    .attr('data-temp', d => baseTemp + d.variance)
    .style('fill', d => colorScale(baseTemp + d.variance))
    .on('mouseover', function(event, d) {
      const temp = (baseTemp + d.variance).toFixed(1);
      tooltip.style('opacity', 0.9)
        .attr('data-year', d.year)
        .html(`${d.year} - ${monthNames[d.month - 1]}<br>
              ${temp}°C<br>
              ${d.variance > 0 ? '+' : ''}${d.variance.toFixed(1)}°C`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.style('opacity', 0);
    });

  // Create legend
  const legendWidth = 400;
  const legendHeight = 20;
  const legendThresholds = colorScale.range().length;
  const legendXScale = d3.scaleLinear()
    .domain([minTemp, maxTemp])
    .range([0, legendWidth]);

  const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${(width - legendWidth) / 2}, ${height + 50})`);

  const legendXAxis = d3.axisBottom(legendXScale)
    .tickFormat(d3.format('.1f'))
    .tickSize(10)
    .tickValues(d3.range(minTemp, maxTemp, (maxTemp - minTemp) / legendThresholds));

  legend.append('g')
    .call(legendXAxis);

  // Create legend boxes
  const step = legendWidth / colorScale.range().length;

  legend.selectAll('rect')
    .data(colorScale.range())
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * step)
    .attr('y', -legendHeight)
    .attr('width', step)
    .attr('height', legendHeight)
    .style('fill', d => d);
}
});
