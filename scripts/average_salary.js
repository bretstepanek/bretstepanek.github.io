var tooltipFormatSalary = d3v4.format("$,");
var marginSalary = {top: 20, right: 200, bottom: 80, left: 50},
    widthSalary = 1000 - marginSalary.left - marginSalary.right,
    heightSalary = 500 - marginSalary.top - marginSalary.bottom;

//chart setup
var svgSalary = d3v4.select("#salaryGraph").append("svg")
    .attr("width", widthSalary + marginSalary.left + marginSalary.right)
    .attr("height", heightSalary + marginSalary.top + marginSalary.bottom);
    gSalary = svgSalary.append("g").attr("transform", "translate(" + marginSalary.left + "," + marginSalary.top + ")");

//y position calculation function
var ySalary = d3v4.scaleLinear()
      .domain([0,80000])
      .range([heightSalary, 0]);

var x0Salary = d3v4.scaleBand()  // domain defined below
      .rangeRound([0, widthSalary])
      .paddingInner(0.1)
      .paddingOuter(0.1);

var x1Salary = d3v4.scaleBand()  // domain and range defined below
    .paddingOuter(0.25)
    .paddingInner(0.15);

//colors
var zSalary = d3v4.scaleOrdinal()
        .range(legendColorsEmployment);

// zSalary.range(zSalary.range().reverse())
var legendColorsSalary = zSalary.range().reverse()
//reference to the y axis
//axisLeft put labels on left side
//ticks(n) refers to # of increment marks on the axis
const yAxisSalary = d3v4.axisLeft(ySalary).ticks(8,"$.0s");

d3v4.tsv("./data/average_salary.tsv", function(error, data) {
  if (error) throw error;
  // format the data
  data.forEach(function(d) {
    d.year = +d.year;
    d["500+"] = +d["500+"];
    d["100-499"] = +d["100-499"];
    d["20-99"] = +d["20-99"];
    d["10-19"] = +d["10-19"];
    d["5-9"] = +d["5-9"];
    d["0-4"] = +d["0-4"];
  });

  //examine first object, retrieve the keys, and discard the first key
  //return resulting array of keys
  var subCategoriesSalary = Object.keys(data[0]).slice(1);
  var legendTextSalary = Object.keys(data[0]).slice(1).reverse();

  //use new array from just the year values for the bottom x-axis
  x0Salary.domain(data.map( d =>  d.year ));

  x1Salary.domain(subCategoriesSalary).rangeRound([0, x0Salary.bandwidth()])

  // Add bar chart
    var selection = gSalary.selectAll("g")
      .data(data)
      .enter().append("g")
        .attr("transform", d => "translate(" + x0Salary(d.year) + ",0)" )
      selection.selectAll("rect")
      //Use map function with the subCategoriesSalary array and the Econ2 array
       .data(function(d) { return subCategoriesSalary.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("x", d => x1Salary(d.key) )
      //If the value is negative, put the top left corner of the rect bar on the zero line
        .attr("y", d => (d.value<0 ? ySalary(0) : ySalary(d.value)) )
        .attr("width", x1Salary.bandwidth())
        .attr("height", d => Math.abs(ySalary(d.value) - ySalary(0)) )
        .attr("fill", d => zSalary(d.key) )
      .on("mouseover", function(){ tooltipSalary
        .style("visibility", "visible")})
      .on("mousemove", function(d){ tooltipSalary
        .style("top", (d3v4.event.pageY-10)+"px").style("left",(d3v4.event.pageX+10)+"px")
        .text(tooltipFormatSalary(d.value))})
     .on("mouseout", function(){ tooltipSalary.style("visibility", "hidden")});

  //add the x-axis
  gSalary.append("g")
      .attr("class", "axisSalary")
      .attr("transform", "translate(0," + (heightSalary) + ")")
      .call(d3v4.axisBottom(x0Salary))
      .selectAll(".tick text")
      //use wrap function to wrap long lines in labels
      .call(wrap, x0Salary.bandwidth());

  //add the y-axis - notice it does not have css class 'axis'
  gSalary.append('g')
  .call(yAxisSalary)

  //idenitfy zero line on the y axis.
  gSalary.append("line")
      .attr("y1", ySalary(0))
      .attr("y2", ySalary(0))
      .attr("x1", 0)
      .attr("x2", widthSalary)
      .attr("stroke", "black");

var legend = gSalary.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 13)
      .attr("text-anchor", "start")
    .selectAll("g")
    .data(subCategoriesSalary)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(100," + i * 20 + ")"; });
  legend.append("rect")
      .attr("x", widthSalary - 105)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", function(d,i){return legendColorsSalary[i]});
  legend.append("text")
          .attr("x", d => d.length > 7 ? (widthSalary + 5) : (widthSalary - 80))
          .attr("y", 9)
          .attr("dy", "0.22em")
          .text(function(d,i){return legendTextSalary[i]});

//https://bl.ocks.org/mbostock/7555321 - wrap long labels
  function wrap(text, width) {
            text.each(function() {
              var text = d3v4.select(this),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line = [],
                  lineNumber = 0,
                  lineHeight = 1.1, // ems
                  y = text.attr("y"),
                  dy = parseFloat(text.attr("dy")),
                  tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
              while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
              }
            });
          }
})

var tooltipSalary = d3v4.select("body")
      .append("div")
      .style("position", "absolute")
      .style("font-family", "'Open Sans', sans-serif")
      .style("font-size", "12px")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("background-color", "white")
      .style("padding", "5px")
      .style("opacity", "0.9");

