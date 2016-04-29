

(function() {


  var margin = {
    top: 30,
    right: 10,
    bottom: 50,
    left: 35
  },
  width = 500 - margin.right - margin.left,
  height = 500 - margin.top - margin.bottom;

      //Set up date formatting and years
      var dateFormat = d3.time.format("%Y");
      var outFormat = d3.time.format("%Y");
      var bycountry = [];

      //Set up scales
      var xScale = d3.time.scale()
                .range([ margin.left, width - margin.right ]);
      var yScale = d3.scale.linear()
                .range([ margin.top, height - margin.bottom ]);

      //Configure axis generators
      var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(5);

      var yAxis = d3.svg.axis()
      .scale(yScale)
      .ticks(4)
      .tickFormat(d3.format("s"))
      .orient("left");

      //Configure line generator
      // each line dataset must have a d.year and a d.amount for this to work.
      var line = d3.svg.line()
        .x(function(d) {
          return xScale(dateFormat.parse(d.year));
        })
        .y(function(d) {
          return yScale(+d.change_income);
        });

      var myTooltip2 = d3.select("body")
              .append("div")
              .attr("class","myTooltip2");

      //Create the empty SVG image
      svg = d3.select("#incstamp").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height )
        .attr("preserveAspectRatio", "xMinYMin slice");


      //Load data
      d3.csv("data/incomeStamps.csv", function(error, data) {
        var years = ["2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013"];

          //Loop once for each row in data

        var byyear = [];
          data.forEach(function (d) {
            if (d.year != "2005") {
              byyear.push(d);
            }
          });


        console.log("POR ANOS", byyear);

        var bycounty = d3.nest().key(function (d) {
                      return d.county;
                                      })
                      .entries(byyear);

        console.log("DATA", data);
        console.log("COUNTY INFO", bycounty);

        //Set scale domains - max and mine of the years
        xScale.domain(
          d3.extent(years, function(d) {
            return dateFormat.parse(d);
          })
        );
        // max of emissions to 0 (reversed, remember)
        yScale.domain([
          d3.max(bycounty, function(d) {
            return d3.max(d.values, function(d) {
              return +d.change_income;
            });
          }),
          -10
        ]);

        //Make a group for each country
        var groups = svg.selectAll("g")
					.data(bycounty)
					.enter()
					.append("g")
					.attr("class", "lines_chart");


        //Within each group, create a new line/path,
        //binding just the emissions data to each one
        groups.selectAll("path")
          .data(function(d) { // because there's a group with data already...
            return [ d.values ]; // it has to be an array for the line function
          })
          .enter()
          .append("path")
          .attr("class", "line")
          .classed("floriline", function (d, i) {
        	console.log(d[i].county);
        	if (d[i].county === "Florida1") {
        		console.log("true");
        		return true;
        	} else {
        		console.log("false");
        		return false;
        	}
        })
          .attr("d", line);



        var circles = groups.selectAll("circle")
                    .data(function(d) { // because there's a group with data already...
                          return d.values; // NOT an array here.
                    })
                    .enter()
                    .append("circle");
            circles.attr("cx", function(d) {
                return xScale(dateFormat.parse(d.year));
              })
              .attr("cy", function(d) {
                return yScale(+d.change_income);
              })
              .attr("r", 1.5)
              .attr("fill", "rgba(136,136,136,1)")
              .style("opacity", 0); // this is optional - if you want visible dots or not!

        //Axes
        svg.append("g")
        .attr("class", "x axis")
        .attr("id", "text_line")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width-margin.right)
        .attr("y", 30)
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .attr("id", "label_line")
        .text("Year (from 2006 to 2013)");

      svg.append("g")
        .attr("class", "y axis")
        .attr("id", "axisblank")
        .attr("transform", "translate(" + (margin.left) + ",0)")
        .call(yAxis);

        svg.append("text")
            .attr("transform", "translate(" + (margin.right + margin.left + 130) + ",0)")
            .attr("dy", "1em")
            .attr("dx", "3em")
  					.attr("text-anchor", "start")
            .attr("id", "country_label")
  					.text("Children receiving food stamps (%)");

        svg.append("text")
            .attr("transform", "translate(" + (margin.right + margin.left + 125) + ",0)")
            .attr("dy", "18.9em")
            .attr("dx", "3em")
            .attr("text-anchor", "start")
            .attr("id", "country_label2")
            .text("Yearly change in median income (%)");

        var zeroLine = svg.append("line")
                .attr("class", "zeroline")
                .attr("x1", margin.left)
                .attr("x2", width - margin.right)
                .attr("y1", 293.5)
                .attr("y2", 293.5);


        circles
              .on("mouseover", mouseoverFunc)
              .on("mousemove", mousemoveFunc)
              .on("mouseout",	mouseoutFunc)
              .style('cursor','pointer');


        function mouseoverFunc(d) {
                d3.select(this)
                  .transition()
                  .style("opacity", 1)
                  .attr("r", 4);
                myTooltip2
                  .style("display", null) // this removes the display none setting from it
                  .html("<p>Year: " + d.year +
                        "<br>Value: <em>" + d3.format(",")(d.change_income) + "%</em></p>");
                d3.selectAll("path.line").classed("unfocused", true);
                        // now undo the unfocus on the current line and set to focused.
                d3.selectAll(this).select("path.line").classed("unfocused", false).classed("focused", true);
                }
        function mousemoveFunc(d) {
                myTooltip2
                  .style("top", (d3.event.pageY - 10) + "px" )
                  .style("left", (d3.event.pageX + 10) + "px");
                }
        function mouseoutFunc(d) {
                d3.select(this)
                  .transition()
                  .style("opacity", .3)
                  .attr("r", 1.5);
                myTooltip2.style("display", "none");  // this sets it to invisible!
                d3.selectAll("path.line").classed("unfocused", false).classed("focused", false);
              }



  });


})();
