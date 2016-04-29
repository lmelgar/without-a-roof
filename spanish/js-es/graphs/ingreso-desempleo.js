/*--------------------------------------------------------------------------
Scatter: median income & unemployment
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

  var dotOpacity = .6;
  var startYear = 2005,
  filterValue = 2005;

  //legend meaning
  var svgLegend;

  svgLegend = d3.select("#legend1").append("svg")
        .attr("height",55)
        .attr("width", 300);

  svgLegend.append("circle")
        .attr("r", 7)
        .attr("cy", 15)
        .attr("cx", 10)
        .attr("fill", "rgb(184,92,87)")
        .attr("opacity", .6);

svgLegend.append("text")
        .attr("y", 20)
        .attr("x", 22)
        .attr("class", "redLegend")
        .text("Condados con mayor porcentaje");
svgLegend.append("text")
        .attr("y", 40)
        .attr("x", 22)
        .attr("class", "redLegend")
        .text("de estudiantes sin hogar");

var svgAvg;

svgAvg = d3.select("#avg1").append("svg")
        .attr("height", 30)
        .attr("width", 300);

svgAvg.append("line")
      .attr("class", "svgAvg")
      .attr("x1", 0)
      .attr("x2", 16)
      .attr("y1", 16)
      .attr("y2", 16);


svgAvg.append("text")
          .attr("y",20)
          .attr("x", 22)
          .attr("class", "redLegend")
          .text("Promedio");

  var myTooltip2 = d3.select("body")
   .append("div")
   .attr("class", "myTooltip2");

  /*--------------------------------------------------------------------------
  Scale, Axis Variables & Setup
  --------------------------------------------------------------------------*/

  var xMax = 15;
  var yMax = 72000;

  var xScale = d3.scale.linear()
  .range([margin.left, width-margin.right]);
  var yScale = d3.scale.linear()
  .range([margin.top, height - margin.bottom]);

  var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .tickFormat(function(d) { return parseInt(d, 10) + "%"; })
  .ticks(5);

  var yAxis = d3.svg.axis()
  .scale(yScale)
  .ticks(5)
  .tickFormat(d3.format("s"))
  .orient("left");


  xScale.domain([0, xMax]);
  yScale.domain([yMax, 26000]);

  svg = d3.select("#incunemp").append("svg")
  .attr("viewBox", "0 0 " + width + " " + height )
  .attr("preserveAspectRatio", "xMinYMin slice");

  /*dropdown*/
  var dropDown = d3.select("#filter").append("select")
                  .attr("class", "menu")
                  .attr("name", "county-list");



  var sliderOkay = false;


  /*--------------------------------------------------------------------------
  Slider
  --------------------------------------------------------------------------*/
  // see examples in http://www.macwright.org/chroniton/example/


  function drawSlider() {
    d3.select("#slider").append('div')
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


  d3.csv("../data/dataSet.csv", function(error, data) {

    console.log("datos", data);

    var dataflor = [];
				  data.forEach(function (d) {
				      if (d.select === "ok") {
				      dataflor.push(d);
				        }
				      });

console.log("NO FLORIDA", dataflor);


              var bycounty = d3.nest()
                 .key(function (d) {
                   return d.county;
                 })
                 .entries(dataflor);

    console.log("BY COUNTIES", bycounty);


    /*dropdown*/
    var options = dropDown.selectAll("option")
             .data([{key:"Todos"}].concat(bycounty))
             .enter()
             .append("option");


    options.text(function (d) { return d.key; })
    .attr("value", function (d) { return d.key; });

    dropDown.on("change", function() {
      var selected = this.value;
      displayOthers = this.checked ? "inline" : "none";
      display = this.checked ? "none" : "inline";

      if(selected == 'Todos'){
        svg.selectAll(".dots")
            .attr("display", display);
      }
      else {

        svg.selectAll(".dots").classed("dotselected", false);
        svg.selectAll(".dots")
            .filter(function(d) {return selected == d.county;})
            .attr("display", display)
            .classed("dotselected", true);
      }

  });
    d3.select(window).on('resize', resize);

    function resize() {


    }
    var swidth = parseInt(d3.select('#slider').style('width'),10);
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

    console.log("NEST", nest);


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
      .text("Desempleo");

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
      .text("Ingreso promedio por hogar");
    }



    /*--------------------------------------------------------------------------
    drawScatter()
    --------------------------------------------------------------------------*/
    function drawScatter(year) {
      year = year;
      console.log(year);
      var yearData = nest.get(year);
      console.log(yearData);

      var xmean = getMean(yearData, "flor_unemp");
      var ymean = getMean(yearData, "flor_medianincome");

      console.log("MEAN1", xmean);
      console.log("MEAN2", ymean);

      /*---------------------------------------------------------------------
      Circles
      ---------------------------------------------------------------------*/
      var circles = svg.selectAll("circle")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("class", "dots")
      .attr("id", function(d) {
        return d.county;
      });

      circles.attr("cx", function (d) {
        if (!isNaN(d.unemployment)) {
          return xScale(+d.unemployment);
        }
      })
      .attr("cy", function (d) {
        if (!isNaN(d.median_income)) {
          return yScale(+d.median_income);
        }
      })
      .attr("r", function (d) {
        if (!isNaN(d.perc_homeless)) {
          return dotRadius(d.perc_homeless);
        }
      })
      .attr("fill", function (d) {
        if (d.selection == "Top") {
          return "rgb(184,92,87)";
        }
        else {
          return "#BFBFBF";
        }
      })
      .attr("opacity", function (d) {
        if ((d.unemployment) && (d.median_income)) {
          return dotOpacity;
        } else {
          return 0;
        }
      });

      circles.on("mouseover", mouseoverFunc)
      .on("mouseout", mouseoutFunc)
      .on("mousemove", mousemoveFunc)
      .style('cursor','pointer');


      var ymeanline = svg.append("line")
        .attr("class", "meanline")
        .attr("id", "ymean1")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(ymean))
        .attr("y2", yScale(ymean));

      var xmeanline = svg.append("line")
        .attr("class", "meanline")
        .attr("id", "xmean1")
        .attr("x1", xScale(xmean))
        .attr("x2", xScale(xmean))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom);

    }


    /*--------------------------------------------------------------------------
    Call the functions
    --------------------------------------------------------------------------*/

    drawAxes();
    drawScatter(startYear);
    drawSlider();

  });

  /*--------------------------------------------------------------------------
  redraw()
  --------------------------------------------------------------------------*/

  function redraw(year) {

    var year = year;
    var yearData = nest.get(year);
    console.log(nest.get(year));
    var circles = svg.selectAll("circle.dots")
    .data(yearData);

    console.log(svg);

    var xmean = getMean(yearData, "flor_unemp");
    var ymean = getMean(yearData, "flor_medianincome");

    console.log("MEANVA1", xmean);
    console.log("MEANVA2", ymean);

    console.log(circles);

    circles.attr("fill", function (d) {
      if (!(d.median_income) || !(d.unemployment)) {
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

    circles.transition()
    .duration(100)
    .ease("quad")
    .attr("cx", function (d) {
      if (!isNaN(d.unemployment)) {
        return xScale(+d.unemployment);
      }
    })
    .attr("cy", function (d) {
      if (!isNaN(d.median_income)) {
        return yScale(+d.median_income);
      }
    })
    .attr("r", function (d) {
      if (!isNaN(d.perc_homeless)) {
        return dotRadius(d.perc_homeless);
      }
    })
    .attr("fill", function (d) {
      if (d.selection == "Top") {
        return "rgb(184,92,87)";
      }
      else {
        return "#BFBFBF";
      }
    })
    .attr("opacity", function (d) {
      if ((d.median_income) && (d.unemployment)) {
        return dotOpacity;
      } else {
        return 0;
      }
    });

    d3.select("line#xmean1").transition()
        .attr("x1", xScale(xmean))
        .attr("x2", xScale(xmean))
        .duration(100)
        .ease("quad");

    d3.select("line#ymean1").transition()
      .attr("y1", yScale(ymean))
      .attr("y2", yScale(ymean))
      .duration(100)
      .ease("quad");

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
  .attr("dy", "-40em")
  .attr("dx", "-8.5em")
  .attr("y", width - margin.right)
  .attr("x", height / 100)
  .text("Estudiantes sin hogar (%)");

  function mouseoverFunc(d) {
    myTooltip2
    .style("display", null) // this removes the display none setting from it
    .html("<p>" + "<span>" + d.county + "</span>" +
    "<br>Estudiantes sin hogar: " + "<em>" + d.perc_homeless + "%</em>" +
    "<br>Ingreso medio por hogar: " + "<em>" + d3.format(",d")(d.median_income) + "$</em>" +
    "<br>Desempleo: <em>" + d.unemployment + "%</em>" + "</p>");


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

  function getMean(data, column) {
      return d3.sum(data, function(d) { return +d[column]});
  }

})();
