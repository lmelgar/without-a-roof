/*--------------------------------------------------------------------------
Map: total population and percentage

This code is based on http://bl.ocks.org/CafeConVega/65d4fb217d2127e30e37093c3a138610
--------------------------------------------------------------------------*/

(function() {

  var current = "perc_homeless"; // default view

  var width = 320,
      height = 300;

  // use a d3 map to make a lookup table for the string in the chart title
  var chartLabels = d3.map();
    chartLabels.set("homeless_pop", "Total homeless student");
    chartLabels.set("perc_homeless", "Percentage of homeless students");


  // Not going to lie, there's a ton of trial and error here.
  var projection = d3.geo.conicEqualArea()
        .parallels([31,25])
        .rotate([81, 0])
        .center([0, 28])
        .translate([280,160])
        .scale(2795);

  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("#map1").append("svg")
      .attr("viewBox", "0 0 " + width + " " + height )
      .attr("preserveAspectRatio", "xMinYMin slice");
      /*.attr("width", width)
      .attr("height", height)*/;

  var myTooltip2 = d3.select("body").append("div").attr("class", "myTooltip2");

  var idLookup = d3.map();

  // all our data is a binary 1 or 2 for this dataset.
  var colorScale = d3.scale.quantize().range(["#EAD4CE", "#DCB2AA", "#CF9389", "#C3776E", "#B85C57"]);

  // we use queue because we have 2 data files to load.
  queue()
    .defer(d3.json, "data/us_counties_topo.json")
    .defer(d3.csv, "data/dataSet2013.csv", typeAndSet) // process
    .await(loaded);

  function loaded(error, us, data) {
    if (error) throw error;

  colorScale.domain(d3.extent(data, function(d) { return +d[current];}));

    var states = topojson.feature(us, us.objects.states).features;
    var florida = states.filter(function(d) { return d.id == 12;})[0];
    var counties = topojson.feature(us, us.objects.counties).features;
    var flcounties = counties.filter(function(d) {
      return d.id.toString().match(/^12/); // look for counties starting with 12
    });
    console.log("counties",flcounties);

    svg.selectAll("path.state")
      .data(florida)
      .enter().append("path")
        .attr("d", path)
        .attr("class", "state");

    svg.selectAll("path.county")
        .data(flcounties)
      .enter().append("path")
        .attr("d", path)
        .attr("class", "county")
        .attr("fill", function(d,i) {
          var data = idLookup.get(d.id);
          if (data) {
            return colorScale(+data[current]);
          } else {
            return "darkgray";
          }
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

        d3.select(window).on('resize', resize);

        function resize() {


        }

  d3.selectAll(".btn")
      .on("click", function() {
          var item = d3.select(this);
          d3.selectAll("#buttons .btn").classed("selected", false);
          current = item.attr("id");
          colorScale.domain(d3.extent(data, function(d) { return +d[current];}));

          legendColors = d3.legend.color()
              .shapeWidth(15)
              .labelFormat(d3.format(",.0f"))
              .scale(colorScale); // our existing color scale

              svg.select(".legendColors")
              .call(legendColors);


          var label = chartLabels.get(current);
          item.classed("selected", true);
          item.classed(item.attr("id"), true);
          updateFill(current);
      });
  console.log("data", data);

   svg.append("g")
      .attr("class", "legendColors")
      .attr("transform", "translate(15, 125)"); // where we put it on the page!

      var legendColors = d3.legend.color()
      .shapeWidth(15)
      .labelFormat(d3.format(",.0f"))
      .scale(colorScale); // our existing color scale

      svg.select(".legendColors")
      .call(legendColors);

   var range = d3.extent(data, function(d) { return +d[current];});


  } // end loaded;


    function updateFill(current) {

      console.log("current", current);

      svg.selectAll("path.county")
        .transition()
        .attr("fill", function(d) {
          var data = idLookup.get(d.id);
          if (data) {
            return colorScale(+data[current]);
          } else {
            return "darkgray";
          }
        });
    }


    function typeAndSet(d) {
      // create the lookup hash for the county id in the map (id) and data (fipstxt)
      idLookup.set(+d.FIPStxt, d);
      return d;
    }

    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };



  function mouseover(d) {

      d3.select(this)
        .transition()
        .style("stroke", "#808285")
        .style("stroke-width", "1");

      d3.select(this).moveToFront();

      var data = idLookup.get(d.id);

      if (current == "homeless_pop") {
      myTooltip2
        .style("display", null) // this removes the display none setting from it
        .html("<p><em>" + data.county + "<br></em>In 2013, the population of <br> homeless student was <em>" + d3.format(",.0f")(data[current]) + "</em></p>");
      } else {

      myTooltip2
      .style("display", null) // this removes the display none setting from it
      .html("<p><em>" + data.county + "<br></em>In 2013, the percentage of <br> homeless student was <em>" + data[current] + "%</em></p>");
    }
    }

    function mousemove(d) {
      myTooltip2
        .style("top", (d3.event.pageY - 10) + "px" )
        .style("left", (d3.event.pageX + 10) + "px");
      }


    function mouseout(d) {
      d3.select(this)
        .transition()
        .style("stroke", null)
        .style("stroke-width", null);

      myTooltip2.style("display", "none");  // this sets it to invisible!
    }

  d3.select("button#perc_homeless").classed("selected", true);

})();
