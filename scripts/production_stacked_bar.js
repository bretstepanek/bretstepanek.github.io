var tooltipFormatProduction = d3.format(".2s");

var marginProduction = {top: 20, right: 300, bottom: 30, left: 20},
    widthProduction = 960 - marginProduction.left - marginProduction.right,
    heightProduction = 500 - marginProduction.top - marginProduction.bottom;

var xProduction = d3.scale.ordinal()
    .rangeRoundBands([0, widthProduction]);

var yProduction = d3.scale.linear()
    .rangeRound([heightProduction, 0]);

var xAxisProduction = d3.svg.axis()
    .scale(xProduction)
    .orient("bottom")

var yAxisProduction = d3.svg.axis()
    .scale(yProduction)
    .orient("right")
    .tickFormat(d3.format("0.2s"));

// var legendColorsProduction = ["#ffeecc","#ffe6b3", "#ffcc66", "#ffb31a", "#e69900", "#b37700", "#805500", "#664400", "#332200"];
// var legendColorsProduction = ["#664400","#cc8800","#ffb31a","#ffc34d"]
// var legendColorsProduction = ["#332200","#664400","#996600","#cc8800","#ffaa00","#ffbb33","#ffcc66","#ffd480","#ffdd99","#ffeecc"];
var legendColorsProduction = ["#332200","#996600","#ffaa00","#ffd480"];
// var legendColorsProduction = ["#4d3300", "#996600", "#e69900", "#ffcc66"];
// var colsProduction = ["6M+ Barrels", "1M to 6M Barrels", "500,001 to 1M Barrels", "100,000 to 500,000 Barrels", "60,001 to 100,000 Barrels",  "30,001 to 60,000 Barrels", "15,001 to 30,000 Barrels", "7,501 to 15,000 Barrels", "1,001 to 7,500 Barrels", "1 to 1,000 Barrels"]
var colsProduction = ["1M+ Barrels", "100,001 to 1M Barrels", "30,001 to 100,000 Barrels", "1 to 30,000 Barrels"]
var legendTextProduction = ["Micro", "Medium", "Regional", "National"]
// var colsProduction = ["15,001+ Barrels", "7,501 to 15,000 Barrels", "1,001 to 7,500 Barrels", "1 to 1,000 Barrels"]
// var legendTextProduction = []
//   for (var i=0; i<colsProduction.length; i++){
//     legendTextProduction[i] = colsProduction[colsProduction.length-i-1]
//   }

var svgProduction = d3.select("#productionStacked").append("svg")
    .attr("width", widthProduction + marginProduction.left + marginProduction.right)
    .attr("height", heightProduction + marginProduction.top + marginProduction.bottom)
  .append("g")
    .attr("transform", "translate(" + marginProduction.left + "," + marginProduction.top + ")");

d3.tsv("./data/Production_cleaned.tsv", type, function(error, production) {
  if (error) throw error;
  var layersProduction = d3.layout.stack()(colsProduction.map(function(c) {
    return production.map(function(d) {
      return {x: d.year, y: d[c]};
    });
  }));

  xProduction.domain(layersProduction[0].map(function(d) { return d.x; }));
  yProduction.domain([0, d3.max(layersProduction[layersProduction.length - 1], function(d) { return d.y0 + d.y; })]).nice();

  var layerProduction = svgProduction.selectAll(".layer")
      .data(layersProduction)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return legendColorsProduction[i]; });


  layerProduction.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return xProduction(d.x); })
      .attr("y", function(d) { return yProduction(d.y + d.y0); })
      .attr("height", function(d) { return yProduction(d.y0) - yProduction(d.y + d.y0); })
      .attr("width", xProduction.rangeBand() - 1)

    .on("mouseover", function(){ tooltipProduction
      .style("visibility", "visible")})
    .on("mousemove", function(d){ tooltipProduction
      .style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px")
      .text(tooltipFormatProduction(d.y)+' Barrels')})
   .on("mouseout", function(){ tooltipProduction.style("visibility", "hidden")});

  svgProduction.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + heightProduction + ")")
      .call(xAxisProduction);

  svgProduction.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + widthProduction + ",0)")
      .call(yAxisProduction);

  var legendProduction = svgProduction.selectAll(".legend")
  .data(legendColorsProduction.reverse())
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(100," + i * 19 + ")"; });
 
  legendProduction.append("rect")
    .attr("x", widthProduction - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d, i) {return legendColorsProduction[i];});
   
  legendProduction.append("text")
    .attr("x", widthProduction + 5)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d, i) {return legendTextProduction[i]});
});

function type(d) {
  d.year = d.year;
  colsProduction.forEach(function(c) {d[c] = +d[c]; });
  return d;
}

var tooltipProduction = d3.select("body")
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
