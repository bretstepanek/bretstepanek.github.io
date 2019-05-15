var margin = {top: 25, right: 25, bottom: 20, left: 20};
	widthHeat = 1000 - margin.left - margin.right,
	heightHeat = 500 - margin.top - margin.bottom,
	scale0 = widthHeat,
	barrelsFormat = d3.format(",.2r"),
	percentFormat = d3.format(".1%");

var playButton = d3.select("#play-button");
var moving = false;


var svgHeat = d3.select("#heatMap").append("svg")
	.attr("width", widthHeat + margin.left + margin.right)
	.attr("height", heightHeat + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

queue()
	.defer(d3.csv, "./data/heat_map_production.csv")
	.defer(d3.json, "./data/us.json")
	.await(ready);

var legendTextHeatMap = ["", "1 Barrel", "", "1,000 Barrels", "", "100,000 Barrels", "", "6M Barrels"];
var legendColorsHeatMap = ["#ffffff","#ffffff","#ffe6b3", "#ffcc66", "#ffb31a", "#e69900", "#b37700", "#805500", "#664400", "#332200"];

function ready(error, data, us) {

	var counties = topojson.feature(us, us.objects.counties);

	data.forEach(function(d) {
		d.year = +d.year;
		d.fips = +d.fips;
		d.rate = +d.rate;
	});


	var dataByCountyByYear = d3.nest()
		.key(function(d) { return d.fips; })
		.key(function(d) { return d.year; })
		.map(data);

	counties.features.forEach(function(county) {
		county.properties.years = dataByCountyByYear[+county.id]
	});

	var color = d3.scale.threshold()
		.domain([0, 0.1, 1, 100, 1e3, 1e4, 1e5, 1e6, 6e6])
		.range(legendColorsHeatMap);

	var projectionHeatMap = d3.geo.albersUsa()
		.translate([widthHeat / 2, heightHeat / 2]);

	var path = d3.geo.path()
		.projection(projectionHeatMap);

	var countyShapes = svgHeat.selectAll(".county")
		.data(counties.features)
		.enter()
		.append("path")
			.attr("class", "county")
			.attr("d", path);

	var zoom = d3.behavior.zoom()
		.translate([widthHeat / 2, heightHeat / 2])
		.scale(scale0)
		.scaleExtent([1000, 8 * scale0])
		.on("zoom", zoomed);
	

	function zoomed() {
		projectionHeatMap
			.translate(zoom.translate())
		 	.scale(zoom.scale());

		svgHeat.selectAll("path")
			.attr("d", path);
	}

	countyShapes
		.on("mouseover", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 1);
			tooltip.html(
			"<p><strong>" + d.properties.years[2008][0].county + ", " + d.properties.years[2008][0].state + "</strong></p>" +
			"<table><tbody><tr><td class='wide'>2008 Production:</td><td>" + barrelsFormat((d.properties.years[2008][0].rate)) + "</td></tr>" +
			"<tr><td>2017 Production:</td><td>" + barrelsFormat((d.properties.years[2017][0].rate)) + "</td></tr>" +
			"<tr><td>Total Change:</td><td>" + percentFormat(((d.properties.years[2017][0].rate-d.properties.years[2008][0].rate))/d.properties.years[2008][0].rate)+ "</td></tr>" +
			"<tr><td>Compound Annual Growth Rate:</td><td>" + percentFormat(Math.pow(d.properties.years[2017][0].rate/d.properties.years[2008][0].rate,1/9)-1) + "</td></tr></tbody></table>"
			)
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 0);
		});

	svgHeat.append("path")
		.datum(topojson.feature(us, us.objects.states, function(a, b) { return a !== b; }))
			.attr("class", "states")
			.attr("d", path);
	svgHeat
		.call(zoom)
		.call(zoom.event);

	var legend = svgHeat.append("g")
		.attr("id", "legend");

	var legenditem = legend.selectAll(".legenditem")
		.data(d3.range(8))
		.enter()
		.append("g")
			.attr("class", "legenditem")
			.attr("transform", function(d, i) { return "translate(" + i * 51 + ",0)"; });

	legenditem.append("rect")
		.attr("x", widthHeat - 400)
		.attr("y", -7)
		.attr("width", 50)
		.attr("height", 6)
		.attr("class", "rect")
		.style("fill", function(d, i) { return legendColorsHeatMap[i]; });

	legenditem.append("text")
		.attr("x", widthHeat - 370)
		.attr("y", -10)
		.style("text-anchor", "middle")
		.text(function(d, i) { return legendTextHeatMap[i]; });

	function update(year){
		slider.property("value", year);
		d3.select(".year").text(year);
		countyShapes.style("fill", function(d) {
			try{ return color(d.properties.years[year][0].rate);}
			catch (TypeError) {}
		});
	}

	var slider = d3.select(".slider")
		.append("input")
			.attr("type", "range")
			.attr("min", 2008)
			.attr("max", 2017)
			.attr("step", 1)
			.on("input", function() {
				var year = this.value;
				update(year);
			});

	// playButton
	//     .on("click", function() {
	//     var button = d3.select(this);
	//     if (button.text() == "Pause") {
	//       moving = false;
	//       // clearInterval(timer);
	//       button.text("Play");
	//     } else {
	//     	for(int i = 0; i< 2018; i++) {
	// 		    try {
	// 		        //sending the actual Thread of execution to sleep X milliseconds
	// 		        Thread.sleep(10000);
	// 		    } catch(Exception) {}
	// 		    update(i):
	// 		}
	//       moving = true;
	//       // timer = setInterval(step, 100);
	//       button.text("Pause");
	//     }})

update(2008);

}

d3.select(self.frameElement).style("height", "685px");