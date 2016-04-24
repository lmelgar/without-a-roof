/*--------------------------------------------------------------------------
Scatter: homeless perc & under18bk_perc

This graphic is based on a project by HALINA MADER: http://hmader.github.io/fertility-mortality/index.html
She is really talented. In case you wanna see what she can do: http://halinamader.com/
--------------------------------------------------------------------------*/

(function() {

  /*--------------------------------------------------------------------------
  Setup vars
  --------------------------------------------------------------------------*/

  var margin = {
    top: 10,
    right: 10,
    bottom: 50,
    left: 60
  },
  width = 500 - margin.right - margin.left,
  height = 500 - margin.top - margin.bottom;


  var data;
  var svg;
  var dateFormat = d3.time.format("%Y");
  var year = [];
  var nest = [];

  var dotRadius = 7;


  //legend meaning
  var svgLegend;

  svgLegend = d3.select("#legend8").append("svg")
        .attr("height",55)
        .attr("width", 300);


  svgLegend.append("circle")
        .attr("r", 7)
        .attr("cy", 15)
        .attr("cx", 10)
        .attr("fill", "rgb(184,92,87)")
        .attr("opacity", .7);

  svgLegend.append("text")
      .attr("y", 20)
      .attr("x", 22)
      .attr("class", "redLegend")
      .text("Counties with highest percentage ");
  svgLegend.append("text")
      .attr("y", 40)
      .attr("x", 22)
      .attr("class", "redLegend")
      .text("of homeless students");
      /*.attr("class", "redLegend")
      .text("Counties with highest % of homeless students");


      var tblock = selection.append("text");
tblock.append("tspan")
  .text(line1_text);
tblock.append("tspan")
  .text(line2_text);*/


  var dotOpacity = .7;
  var startYear = 2005,
  filterValue = 2005;

  var myTooltip2 = d3.select("body")
   .append("div")
   .attr("class", "myTooltip2");

  /*--------------------------------------------------------------------------
  Scale, Axis Variables & Setup
  --------------------------------------------------------------------------*/

  var xMax = 65;
  var yMax = 25;

  var xScale = d3.scale.linear()
  .range([margin.left, width-margin.right]);
  var yScale = d3.scale.linear()
  .range([margin.top, height - margin.bottom]);

  var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .ticks(5);

  var yAxis = d3.svg.axis()
  .scale(yScale)
  .ticks(5)
  .tickFormat(d3.format("s"))
  .orient("left");


  xScale.domain([0, xMax]);
  yScale.domain([yMax, 0 -1]);

  /*circleLegend = d3.select("#circleLegend8")
   .append("svg")
   .attr("width", 50)
   .attr("height", 50)
   .append("circle")
   .attr("cx", 50)
   .attr("cy", 5)
   .attr("r", 7)
   .attr("class", "poronga")
   .style("fill", "purple");*/


  svg = d3.select("#afram18hom").append("svg")
  .attr("viewBox", "0 0 " + width + " " + height )
  .attr("preserveAspectRatio", "xMinYMin slice");

  /*dropdown*/
  var dropDown = d3.select("#filter8").append("select")
                  .attr("class", "menu")
                  .attr("name", "county-list");



  var sliderOkay = false;


  /*--------------------------------------------------------------------------
  Slider
  --------------------------------------------------------------------------*/
  // see examples in http://www.macwright.org/chroniton/example/


  function drawSlider() {
    d3.select("#slider8").append('div')
    .call(slider);
    sliderOkay = true;
  }

  function end() {
    console.log(slider.isAtEnd());
    if (slider.isAtEnd()) {
      slider.pause();
    }
  }

  var slider;


  d3.csv("data/dataSet.csv", function(error, data) {

    console.log("datos", data);


    var bycounty = d3.nest()
       .key(function (d) {
         return d.county;
       })
       .entries(data);

       console.log("por condados", bycounty);

    /*dropdown*/
    var options = dropDown.selectAll("option")
             .data([{key:"All"}].concat(bycounty))
             .enter()
             .append("option");


    options.text(function (d) { return d.key; })
    .attr("value", function (d) { return d.key; });

    dropDown.on("change", function() {
      var selected = this.value;
      displayOthers = this.checked ? "inline" : "none";
      display = this.checked ? "none" : "inline";

      if(selected == 'All'){
        svg.selectAll(".dots")
            .attr("display", display);
      }
      else{
        svg.selectAll(".dots")
            .filter(function(d) {return selected != d.county;})
            .attr("display", display)
            .attr("fill", function (d) {
              if (d.selection == "Top") {
                return "rgb(184,92,87)";
              }
              else {
                return "#BFBFBF";
              }
            })
            .attr("opacity", function (d) {
              if ((d.under18bk_perc) && (d.perc_homeless)) {
                return dotOpacity;
              } else {
                return 0;
              }
            });

        svg.selectAll(".dots")
            .filter(function(d) {return selected == d.county;})
            .attr("display", display)
            .attr("opacity", 1)
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.7)
            .attr("stroke", "black")
            .attr("opacity", 1)
            .style("fill", "#D9B26E");
      }
  });

    d3.select(window).on('resize', resize);

    function resize() {


    }
    var swidth = parseInt(d3.select('#slider8').style('width'),10);
    slider = chroniton()
    .domain([dateFormat.parse("2005"), dateFormat.parse("2013")])
    .labelFormat(d3.time.format('%Y'))
    .width(swidth)
    .height(52)
    .playButton(true)
    .playbackRate(.5) // can also be set to loop
    .on("change", function (d) {
      filterValue = dateFormat(d3.time.year(d));
      console.log("filterValue", filterValue);
      if (filterValue <= 2013) {
        redraw(filterValue);
        end();
      }

    });

    year = ["2005", "2007", "2008", "2009", "2010", "2011", "2012", "2013"];

    console.log("year", year)
    //Loop once for each row in data
    nest = d3.nest()
    .key(function (d) {
      return d.year;
    })
    .map(data, d3.map);

    ymean = d3.mean(data, function(d) { return d.perc_homeless; });

    console.log("NEST", nest);
    console.log("MEAN", ymean);


    /*---------------------------------------------------------------------
    drawAxes()
    ---------------------------------------------------------------------*/
    function drawAxes() {
      yAxis.scale(yScale);
      xAxis.scale(xScale);

      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - margin.bottom) + ")")
      .call(xAxis)
      .append("text")
      .attr("x", width-margin.right)
      .attr("y", 30)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .attr("class", "label_sca")
      .text("African Americans under 18 (%)");

      svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (margin.left) + ",0)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -margin.top)
      .attr("dx", "0.1em")
      .attr("y", -45)
      .attr("dy", "0.2em")
      .style("text-anchor", "end")
      .attr("class", "label_sca")
      .text("Homeles students (%)");
    }



    /*--------------------------------------------------------------------------
    drawScatter()
    --------------------------------------------------------------------------*/
    function drawScatter(year) {
      year = year;
      console.log(year);
      var yearData = nest.get(year);
      console.log(yearData);

      /*---------------------------------------------------------------------
      Circles
      ---------------------------------------------------------------------*/
      var circles = svg.selectAll("circle")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("class", "dots");

      circles.attr("cx", function (d) {
        if (!isNaN(d.under18bk_perc)) {
          return xScale(+d.under18bk_perc);
        }
      })
      .attr("cy", function (d) {
        if (!isNaN(d.perc_homeless)) {
          return yScale(+d.perc_homeless);
        }
      })
      .attr("r", dotRadius) // you might want to increase your dotRadius
      .attr("fill", function (d) {
        if (d.selection == "Top") {
          return "rgb(184,92,87)";
        }
        else {
          return "#BFBFBF";
        }
      })
      .attr("opacity", function (d) {
        if ((d.under18bk_perc) && (d.perc_homeless)) {
          return dotOpacity;
        } else {
          return 0;
        }
      });

      circles.on("mouseover", mouseoverFunc)
      .on("mouseout", mouseoutFunc)
      .on("mousemove", mousemoveFunc)
      .style('cursor','pointer');



    }


    /*--------------------------------------------------------------------------
    Call the functions
    --------------------------------------------------------------------------*/

    drawAxes();
    drawScatter(startYear);
    /*setColorDomain();*/
    drawSlider();

  });

  /*--------------------------------------------------------------------------
  redraw()
  --------------------------------------------------------------------------*/

  function redraw(year) {

    var year = year;
    console.log(nest.get(year));
    var circles = svg.selectAll("circle.dots")
    .data(nest.get(year));
    console.log(svg);

    console.log(circles);

    circles.attr("fill", function (d) {
      if (!(d.perc_homeless) || !(d.under18bk_perc)) {
        return "rgba(0, 0, 0, 0)";
      } else {
        if (d.selection == "Top") {
          return "rgb(184,92,87)";
        }
        else {
          return "#BFBFBF";
        }
      }
    });

    circles.exit()
    .transition()
    .duration(100)
    .ease("linear")
    .attr("r", 0)
    .remove();
    // transition -- move to proper widths and location
    circles.transition()
    .duration(100)
    .ease("linear")
    .attr("cx", function (d) {
      if (!isNaN(d.under18bk_perc)) {
        return xScale(+d.under18bk_perc);
      }
    })
    .attr("cy", function (d) {
      if (!isNaN(d.perc_homeless)) {
        return yScale(+d.perc_homeless);
      }
    })
    .attr("r", dotRadius)
    .attr("fill", function (d) {
      if (d.selection == "Top") {
        return "rgb(184,92,87)";
      }
      else {
        return "#BFBFBF";
      }
    })
    .attr("opacity", function (d) {
      if ((d.perc_homeless) && (d.under18bk_perc)) {
        return dotOpacity;
      } else {
        return 0;
      }
    });


  } // end of draw function

  //legend y position
		var LYP = 5,
			LXP = 90;

		//color legend
		/*svg.append("circle")
    .attr("cx", LXP)
    .attr("cy", LYP + 5)
    .attr("r", 7)
    .style("fill", "rgb(53, 135, 212)");
		svg.append("text")
    .attr("class", "legendLabel")
    .attr("x", LXP + 15).attr("y", LYP + 10)
    .style("text-anchor", "start")
    .text(function(d) {
			return "Counties with the highest percentage of homeless students";
		});*/

  function mouseoverFunc(d) {
    myTooltip2
    .style("display", null) // this removes the display none setting from it
    .html("<p>" + "<span>" + d.county + "</span>" +
    "<br>Homeless students: " + "<em>" + (d.perc_homeless) + "%</em>" +
    "<br>African Americans under 18: <em>" + d.under18bk_perc + "%</em>" + "</p>");


    d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
  this.parentNode.appendChild(this);
  });
};
  }
  function mousemoveFunc(d) {
    //console.log("events", window.event, d3.event);
    myTooltip2
    .style("top", (d3.event.pageY - 10) + "px" )
    .style("left", (d3.event.pageX + 15) + "px");
  }
  function mouseoutFunc(d) {
    return myTooltip2.style("display", "none");  // this sets it to invisible!
  }

})();
