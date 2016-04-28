/*--------------------------------------------------------------------------
Scatter: homeless perc & under18hisp_perc

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

  svgLegend = d3.select("#legend9").append("svg")
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
      .text("Counties with highest percentage");
  svgLegend.append("text")
      .attr("y", 40)
      .attr("x", 22)
      .attr("class", "redLegend")
      .text("of homeless students");

var svgAvg;

svgAvg = d3.select("#avg9").append("svg")
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
          .text("Average");



  var dotOpacity = .6;
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
  .ticks(5)
  .tickFormat(function(d) { return parseInt(d, 10) + "%"; });

  var yAxis = d3.svg.axis()
  .scale(yScale)
  .ticks(5)
  .tickFormat(function(d) { return parseInt(d, 10) + "%"; })
  .orient("left");


  xScale.domain([0, xMax]);
  yScale.domain([yMax, 0 -1]);


  svg = d3.select("#hisp18hom").append("svg")
  .attr("viewBox", "0 0 " + width + " " + height )
  .attr("preserveAspectRatio", "xMinYMin slice");

  /*dropdown*/
  var dropDown = d3.select("#filter9").append("select")
                  .attr("class", "menu")
                  .attr("name", "county-list");



  var sliderOkay = false;


  /*--------------------------------------------------------------------------
  Slider
  --------------------------------------------------------------------------*/
  // see examples in http://www.macwright.org/chroniton/example/


  function drawSlider() {
    d3.select("#slider9").append('div')
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
    var swidth = parseInt(d3.select('#slider9').style('width'),10);
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
      .text("Hispanics under 18");

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
      .text("Homeless students");
    }


    /*--------------------------------------------------------------------------
    drawScatter()
    --------------------------------------------------------------------------*/
    function drawScatter(year) {
      year = year;
      console.log(year);
      var yearData = nest.get(year);
      console.log(yearData);

      var xmean = getMean(yearData, "flor_18hisp");
      var ymean = getMean(yearData, "flor_perc_hom");

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
        if (!isNaN(d.under18hisp_perc)) {
          return xScale(+d.under18hisp_perc);
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
        if ((d.under18hisp_perc) && (d.perc_homeless)) {
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
        .attr("id", "ymean9")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(ymean))
        .attr("y2", yScale(ymean));

      var xmeanline = svg.append("line")
        .attr("class", "meanline")
        .attr("id", "xmean9")
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

    var xmean = getMean(yearData, "flor_18hisp");
    var ymean = getMean(yearData, "flor_perc_hom");

    console.log("MEANVA1", xmean);
    console.log("MEANVA2", ymean);

    console.log(circles);

    circles.attr("fill", function (d) {
      if (!(d.perc_homeless) || !(d.under18hisp_perc)) {
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
    .ease("quad")
    .attr("r", 0)
    .remove();

    circles.transition()
    .duration(100)
    .ease("quad")
    .attr("cx", function (d) {
      if (!isNaN(d.under18hisp_perc)) {
        return xScale(+d.under18hisp_perc);
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
      if ((d.perc_homeless) && (d.under18hisp_perc)) {
        return dotOpacity;
      } else {
        return 0;
      }
    });

    d3.select("line#xmean9").transition()
        .attr("x1", xScale(xmean))
        .attr("x2", xScale(xmean))
        .duration(100)
        .ease("quad");

    d3.select("line#ymean9").transition()
      .attr("y1", yScale(ymean))
      .attr("y2", yScale(ymean))
      .duration(100)
      .ease("quad");


  } // end of draw function



  function mouseoverFunc(d) {
    myTooltip2
    .style("display", null) // this removes the display none setting from it
    .html("<p>" + "<span>" + d.county + "</span>" +
    "<br>Homeless students: " + "<em>" + (d.perc_homeless) + "%</em>" +
    "<br>Hispanics under 18: <em>" + d.under18hisp_perc + "%</em>" + "</p>");


    d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
  this.parentNode.appendChild(this);
  });
};
  }
  function mousemoveFunc(d) {
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
