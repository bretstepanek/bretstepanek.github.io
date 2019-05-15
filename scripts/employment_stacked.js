var tooltipFormatEmployment = d3.format(".2s");

var marginEmployment = {top: 20, right: 300, bottom: 30, left: 20},
    widthEmployment = 960 - marginEmployment.left - marginEmployment.right,
    heightEmployment = 500 - marginEmployment.top - marginEmployment.bottom;

var xEmployment = d3.scale.ordinal()
    .rangeRoundBands([0, widthEmployment]);

var yEmployment = d3.scale.linear()
    .rangeRound([heightEmployment, 0]);

var xAxisEmployment = d3.svg.axis()
    .scale(xEmployment)
    .orient("bottom")

var yAxisEmployment = d3.svg.axis()
    .scale(yEmployment)
    .orient("right")
    .tickFormat(d3.format("0.2s"));

// var legendColorsEmployment = ["#ffeecc","#ffe6b3", "#ffcc66", "#ffb31a", "#e69900", "#b37700", "#805500", "#664400", "#332200"];
// var legendColorsEmployment = ["#664400","#cc8800","#ffb31a","#ffc34d"]
// var legendColorsEmployment = ["#332200","#664400","#996600","#cc8800","#ffaa00","#ffbb33","#ffcc66","#ffd480","#ffdd99","#ffeecc"];
var legendColorsEmployment = ["#332200","#664400","#996600","#ffaa00","#ffbb33","#ffdd99"];
// var legendColorsEmployment = ["#4d3300", "#996600", "#e69900", "#ffcc66"];
// var colsEmployment = ["6M+ Barrels", "1M to 6M Barrels", "500,001 to 1M Barrels", "100,000 to 500,000 Barrels", "60,001 to 100,000 Barrels",  "30,001 to 60,000 Barrels", "15,001 to 30,000 Barrels", "7,501 to 15,000 Barrels", "1,001 to 7,500 Barrels", "1 to 1,000 Barrels"]
var colsEmployment = ["500+", "100-499", "20-99", "10-19", "5-9", "0-4"]
// var colsEmployment = ["15,001+ Barrels", "7,501 to 15,000 Barrels", "1,001 to 7,500 Barrels", "1 to 1,000 Barrels"]
var legendTextEmployment = []
  for (var i=0; i<colsEmployment.length; i++){
    legendTextEmployment[i] = colsEmployment[colsEmployment.length-i-1]
  }

var svgEmployment = d3.select("#employmentStacked").append("svg")
    .attr("width", widthEmployment + marginEmployment.left + marginEmployment.right)
    .attr("height", heightEmployment + marginEmployment.top + marginEmployment.bottom)
  .append("g")
    .attr("transform", "translate(" + marginEmployment.left + "," + marginEmployment.top + ")");

d3.tsv("./data/employment.tsv", type, function(error, employment) {
  if (error) throw error;
  var layersEmployment = d3.layout.stack()(colsEmployment.map(function(c) {
    return employment.map(function(d) {
      return {x: d.year, y: d[c]};
    });
  }));

  xEmployment.domain(layersEmployment[0].map(function(d) { return d.x; }));
  yEmployment.domain([0, d3.max(layersEmployment[layersEmployment.length - 1], function(d) { return d.y0 + d.y; })]).nice();

  var layerEmployment = svgEmployment.selectAll(".layer")
      .data(layersEmployment)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return legendColorsEmployment[i]; });


  layerEmployment.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return xEmployment(d.x); })
      .attr("y", function(d) { return yEmployment(d.y + d.y0); })
      .attr("height", function(d) { return yEmployment(d.y0) - yEmployment(d.y + d.y0); })
      .attr("width", xEmployment.rangeBand() - 1)

    .on("mouseover", function(){ tooltipEmployment
      .style("visibility", "visible")})
    .on("mousemove", function(d){ tooltipEmployment
      .style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px")
      .text(tooltipFormatEmployment(d.y)+' people employed')})
   .on("mouseout", function(){ tooltipEmployment.style("visibility", "hidden")});

  svgEmployment.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + heightEmployment + ")")
      .call(xAxisEmployment);

  svgEmployment.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + widthEmployment + ",0)")
      .call(yAxisEmployment);

  var legendEmployment = svgEmployment.selectAll(".legend")
  .data(legendColorsEmployment.reverse())
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(100," + i * 19 + ")"; });
 
  legendEmployment.append("rect")
    .attr("x", widthEmployment - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d, i) {return legendColorsEmployment[i];});
   
  legendEmployment.append("text")
    .attr("x", widthEmployment + 5)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d, i) {return legendTextEmployment[i]});
});

function type(d) {
  d.year = d.year;
  colsEmployment.forEach(function(c) {d[c] = +d[c]; });
  return d;
}

var tooltipEmployment = d3.select("body")
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