var marginTimeline = {top: 0, right: 20, bottom: 0, left: 20};
    widthTimeline = 960 - marginTimeline.left - marginTimeline.right,
    heightTimeline = 450 - marginTimeline.top - marginTimeline.bottom,
    scale0Timeline = widthTimeline;

var mapPath = "./data/us.json";

var projectionTimeline = d3.geo.albersUsa()
    .scale(990)
    .translate([widthTimeline / 2, heightTimeline / 2]);

var path = d3.geo.path()
    .projection(projectionTimeline);

var svgTimeline = d3.select("#mapTimeline").append("svg")
    .attr("width", widthTimeline)
    .attr("height", heightTimeline)
    .append("g")
      .attr("transform", "translate(" + marginTimeline.left + "," + marginTimeline.top + ")");

var yearText = d3.select("#yearText").text("1829");
var yearTextData = d3.select("#yearTextData").text("1 new brewery started in 1829");

queue()
  .defer(d3.json, "./data/us.json")
  .await(ready);

function ready(error, us) {

// d3.json(mapPath, function(error, us) {
  if (error) return console.error(error);

  // var zoomTimeline = d3.behavior.zoom()
  //   .translate([widthTimeline / 2, heightTimeline / 2])
  //   .scale(scale0Timeline)
  //   .scaleExtent([scale0Timeline, 8 * scale0Timeline])
  //   .on("zoom", zoomed());


  // function zoomed() {
  //   console.log('zoom')
  //   projectionTimeline
  //     .translate(zoomTimeline.translate())
  //     .scale(zoomTimeline.scale());

  //   svgTimeline.selectAll()
  //     .attr("d", path);
  // }

  svgTimeline.append("path")
      .datum(topojson.feature(us, us.objects.land))
      .attr("d", path)
      .attr("class", "land-boundary");

  svgTimeline.append("path")
      .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
      .attr("d", path)
      .attr("class", "county-boundary");

  svgTimeline.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("d", path)
      .attr("class", "state-boundary");

  // svgTimeline
  //   .call(zoom)
  //   .call(zoom.event);

  d3.tsv("./data/timelineData.txt")
    .row(function(d) {
      return {
        lat: parseFloat(d.lat),
        lng: parseFloat(d.long),
        city: d.city,
        founded: parseInt(d.founded),
        name: d.name
      };
    })
    .get(function(err, rows) {
    	if (err) return console.error(err);

      window.site_data = rows;
    });
// };

var oldsites = function(data) {
  var sites = svgTimeline.selectAll(".site")
      .data(data, function(d) {
        return d.city;
      });

  sites.enter().append("circle")
      .attr("class", "site")
      .attr("cx", function(d) {
        return projectionTimeline([d.lng, d.lat])[0];
      })
      .attr("cy", function(d) {
        return projectionTimeline([d.lng, d.lat])[1];
      })
      .attr("r", 2);

  sites.attr("r",2)

  sites
      .on("mouseover", function(d) {
      tooltip.transition()
      .duration(250)
      .style("opacity", 1);
      tooltip.html(
      "<p><strong>" + d.name + "</strong></p>" +
      "<p> Founded in: " + d.founded + "</p>"
      )
      .style("left", (d3.event.pageX + 15) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
      .duration(250)
      .style("opacity", 0);
    });

  sites.exit()
    .transition().duration(200)
      .attr("r",1)
      .remove();
};

var newsites = function(data) {
  var sites = svgTimeline.selectAll(".site")
      .data(data, function(d) {
        return d.city;
      });

  sites.enter().append("circle")
      .attr("class", "site")
      .attr("cx", function(d) {
        return projectionTimeline([d.lng, d.lat])[0];
      })
      .attr("cy", function(d) {
        return projectionTimeline([d.lng, d.lat])[1];
      })
      .attr("r", 1)
      .transition().duration(400)
        .attr("r", 5);

  sites
      .on("mouseover", function(d) {
      tooltip.transition()
      .duration(250)
      .style("opacity", 1);
      tooltip.html(
      "<p><strong>" + d.name + "</strong></p>" +
      "<p> Founded in: " + d.founded + "</p>"
      )
      .style("left", (d3.event.pageX + 15) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
      .duration(250)
      .style("opacity", 0);
    });

  // sites.exit()
  //   .transition().duration(200)
  //     .attr("r",1)
  //     .remove();
};


d3.select('#slider3').call(d3.slider()
  .axis(true).min(1829).max(2019).step(1)
  .on("slide", function(evt, value) {
    if (value == 2020){value = 2019}
    var currentData = _(site_data).filter( function(site) {
      return (site.founded == value);
    })
    var newData = _(site_data).filter( function(site) {
      return (site.founded <= value);
    })
    yearText.text(value)
    yearTextData.text(currentData.length+" new breweries started in "+value)
    newsites(currentData);
    oldsites(newData);
  })
);

};