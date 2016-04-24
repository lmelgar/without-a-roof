/*--------------------------------------------------------------------------
Scatter: level of maths & perc_foodstamp

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
  var nest2013 = [];

  var dotRadius = d3.scale.sqrt()
  .domain([0, 22])
  .range([0, 22]);

  var dotOpacity = .7;
  var startYear = 2005,
  filterValue = 2005;

  var myTooltip2 = d3.select("body")
   .append("div")
   .attr("class", "myTooltip2");

  /*--------------------------------------------------------------------------
  Scale, Axis Variables & Setup
  --------------------------------------------------------------------------*/

  var xMax = 60;
  var yMax = 90;

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
  yScale.domain([yMax, 0]);

  svg = d3.select("#mathsstamp").append("svg")
  .attr("viewBox", "0 0 " + width + " " + height )
  .attr("preserveAspectRatio", "xMinYMin slice");

  /*dropdown*/
  var dropDown = d3.select("#filter7").append("select")
                  .attr("class", "menu")
                  .attr("name", "county-list");



  var sliderOkay = false;


  /*--------------------------------------------------------------------------
  Slider
  --------------------------------------------------------------------------*/
  // see examples in http://www.macwright.org/chroniton/example/


  function drawSlider() {
    d3.select("#slider7").append('div')
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
              if ((d.perc_foodstamp) && (d.level3highermath_perc)) {
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
    var swidth = parseInt(d3.select('#slider7').style('width'),10);
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

    nest2013 = d3.nest()
    .key(function (d) {
      return d.county;
    })
    .map(data, d3.map);

    console.log("NEST", nest);
    console.log("nest2013", nest2013);


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
      .text("CHILDREN RECEIVING FOOD STAMPS (%)");

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
      .text("Students who scored 3 or more in maths (%)");
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
        if (!isNaN(d.perc_foodstamp)) {
          return xScale(+d.perc_foodstamp);
        }
      })
      .attr("cy", function (d) {
        if (!isNaN(d.level3highermath_perc)) {
          return yScale(+d.level3highermath_perc);
        }
      })
      .attr("r", function (d) {
        if (!isNaN(d.perc_homeless)) {
          return dotRadius(d.perc_homeless);
        }
      }) // you might want to increase your dotRadius
      .attr("fill", function (d) {
        if (d.selection == "Top") {
          return "rgb(184,92,87)";
        }
        else {
          return "#BFBFBF";
        }
      })
      .attr("opacity", function (d) {
        if ((d.perc_foodstamp) && (d.level3highermath_perc)) {
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
      if (!(d.level3highermath_perc) || !(d.perc_foodstamp)) {
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
    .ease("exp")
    .attr("r", 0)
    .remove();
    // transition -- move to proper widths and location
    circles.transition()
    .duration(100)
    .ease("quad")
    .attr("cx", function (d) {
      if (!isNaN(d.perc_foodstamp)) {
        return xScale(+d.perc_foodstamp);
      }
    })
    .attr("cy", function (d) {
      if (!isNaN(d.level3highermath_perc)) {
        return yScale(+d.level3highermath_perc);
      }
    })
    .attr("r", function (d) {
      if (!isNaN(d.perc_homeless)) {
        return dotRadius(d.perc_homeless);
      }
    }) // you might want to increase your dotRadius
    .attr("fill", function (d) {
      if (d.selection == "Top") {
        return "rgb(184,92,87)";
      }
      else {
        return "#BFBFBF";
      }
    })
    .attr("opacity", function (d) {
      if ((d.level3highermath_perc) && (d.perc_foodstamp)) {
        return dotOpacity;
      } else {
        return 0;
      }
    });

  } // end of draw function

  var legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + (width - margin.right - '18') + "," + (height - 385) + ")")
  .selectAll("g")
  .data([5, 15, 25])
  .enter().append("g");

  legend.append("circle")
  .attr("cy", function(d) { return -dotRadius(d); })
  .attr("r", dotRadius);

  legend.append("text")
  .attr("y", function(d) { return -2 * dotRadius(d); })
  .attr("dy", "1em")
  .text(d3.format(".1s"));

  legend.append("text")
  .attr("class", "sphere")
  .attr("dy", "-46em")
  .attr("dx", "-4em")
  .attr("y", width)
  .attr("x", height / 100)
  .text("Homeless students (%)");

  function mouseoverFunc(d) {
    myTooltip2
    .style("display", null) // this removes the display none setting from it
    .html("<p>" + "<span>" + d.county + "</span>" +
    "<br>Homeless students: " + "<em>" + d.perc_homeless + "%</em>" +
    "<br>Students who scored 3 or more in maths: " + "<em>" + d.level3highermath_perc + "%</em>" +
    "<br>Children receiving food stamps: <em>" + d.perc_foodstamp + "%</em>" + "</p>");


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
