
// var parseDate = d3.time.format("%Y").parse;
var tooltipFormatNumber = d3.format(",.1");

var marginNumber = {top: 20, right: 300, bottom: 30, left: 20},
    widthNumber = 960 - marginNumber.left - marginNumber.right,
    heightNumber = 590 - marginNumber.top - marginNumber.bottom;

var xNumber = d3.scale.ordinal()
    .rangeRoundBands([0, widthNumber]);

var yNumber = d3.scale.linear()
    .rangeRound([heightNumber, 0]);

var xAxisNumber = d3.svg.axis()
    .scale(xNumber)
    .orient("bottom")

var yAxisNumber = d3.svg.axis()
    .scale(yNumber)
    .orient("right");

// var legendColorsNumber = ["#ffeecc","#ffe6b3", "#ffcc66", "#ffb31a", "#e69900", "#b37700", "#805500", "#664400", "#332200"];
// var legendColorsNumber = ["#664400","#cc8800","#ffb31a","#ffc34d"]
// var legendColorsProduction = ["#332200","#664400","#996600","#cc8800","#ffaa00","#ffbb33","#ffcc66","#ffd480","#ffdd99","#ffeecc"];
var legendColorsNumber = ["#4d3300", "#996600", "#e69900", "#ffcc66"];
// var colsNumber = ["6M+ Barrels", "1M to 6M Barrels", "500,001 to 1M Barrels", "100,000 to 500,000 Barrels", "60,001 to 100,000 Barrels",  "30,001 to 60,000 Barrels", "15,001 to 30,000 Barrels", "7,501 to 15,000 Barrels", "1,001 to 7,500 Barrels", "1 to 1,000 Barrels"]
var colsNumber = ["15,001+ Barrels", "7,501 to 15,000 Barrels", "1,001 to 7,500 Barrels", "1 to 1,000 Barrels"]
var legendTextNumber = []
  for (var i=0; i<colsNumber.length; i++){
    legendTextNumber[i] = colsNumber[colsNumber.length-i-1]
  }

var svgNumber = d3.select("#numberStacked").append("svg")
    .attr("width", widthNumber + marginNumber.left + marginNumber.right)
    .attr("height", heightNumber + marginNumber.top + marginNumber.bottom)
  .append("g")
    .attr("transform", "translate(" + marginNumber.left + "," + marginNumber.top + ")");

d3.tsv("./data/Number_cleaned.tsv", type, function(error, number) {
  if (error) throw error;

  var layersNumber = d3.layout.stack()(colsNumber.map(function(c) {
    return number.map(function(d) {
      return {x: d.date, y: d[c]};
    });
  }));


  xNumber.domain(layersNumber[0].map(function(d) { return d.x; }));
  yNumber.domain([0, d3.max(layersNumber[layersNumber.length - 1], function(d) { return d.y0 + d.y; })]).nice();

  var layerNumber = svgNumber.selectAll(".layer")
      .data(layersNumber)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return legendColorsNumber[i]; });


  layerNumber.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return xNumber(d.x); })
      .attr("y", function(d) { return yNumber(d.y + d.y0); })
      .attr("height", function(d) { return yNumber(d.y0) - yNumber(d.y + d.y0); })
      .attr("width", xNumber.rangeBand() - 1)

    .on("mouseover", function(){ tooltipNumber
      .style("visibility", "visible")})
    .on("mousemove", function(d){ tooltipNumber
      .style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px")
      .text(tooltipFormatNumber(d.y)+' Breweries')})
   .on("mouseout", function(){ tooltipNumber.style("visibility", "hidden")});

  svgNumber.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + heightNumber + ")")
      .call(xAxisNumber);

  svgNumber.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + widthNumber + ",0)")
      .call(yAxisNumber);

  var legendNumber = svgNumber.selectAll(".legend")
  .data(legendColorsNumber.reverse())
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(100," + i * 19 + ")"; });
 
  legendNumber.append("rect")
    .attr("x", widthNumber - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d, i) {return legendColorsNumber[i];});
   
  legendNumber.append("text")
    .attr("x", widthNumber + 5)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text("test")
    .text(function(d, i) {return legendTextNumber[i]});
});

function type(d) {
  d.date = d.date;
  colsNumber.forEach(function(c) {d[c] = +d[c]; });
  return d;
}

var tooltipNumber = d3.select("body")
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
