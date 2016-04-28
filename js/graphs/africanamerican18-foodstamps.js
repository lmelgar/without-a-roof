/*--------------------------------------------------------------------------
Scatter: median income & under18bk_perc

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

  var dotOpacity = .6;
  var startYear = 2005,
  filterValue = 2005;

  //legend meaning
  var svgLegend;

  svgLegend = d3.select("#legend5").append("svg")
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

svgAvg = d3.select("#avg5").append("svg")
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

  var myTooltip2 = d3.select("body")
   .append("div")
   .attr("class", "myTooltip2");

  /*--------------------------------------------------------------------------
  Scale, Axis Variables & Setup
  --------------------------------------------------------------------------*/

  var xMax = 75;
  var yMax = 60;

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
  .tickFormat(function(d) { return parseInt(d, 10) + "%"; })
  .orient("left");


  xScale.domain([0, xMax]);
  yScale.domain([yMax, 0]);

  svg = d3.select("#afam18stamp").append("svg")
  .attr("viewBox", "0 0 " + width + " " + height )
  .attr("preserveAspectRatio", "xMinYMin slice");

  /*dropdown*/
  var dropDown = d3.select("#filter5").append("select")
                  .attr("class", "menu")
                  .attr("name", "county-list");



  var sliderOkay = false;


  /*--------------------------------------------------------------------------
  Slider
  --------------------------------------------------------------------------*/
  // see examples in http://www.macwright.org/chroniton/example/


  function drawSlider() {
    d3.select("#slider5").append('div')
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
    var swidth = parseInt(d3.select('#slider5').style('width'),10);
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
      .text("African Americans under 18");

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
      .text("Children receiving food stamps");
    }



    /*--------------------------------------------------------------------------
    drawScatter()
    --------------------------------------------------------------------------*/
    function drawScatter(year) {
      year = year;
      console.log(year);
      var yearData = nest.get(year);
      console.log(yearData);

      var xmean = getMean(yearData, "flor_foodstamp");
      var ymean = getMean(yearData, "flor_18afam");

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
        if (!isNaN(d.under18bk_perc)) {
          return xScale(+d.under18bk_perc);
        }
      })
      .attr("cy", function (d) {
        if (!isNaN(d.perc_foodstamp)) {
          return yScale(+d.perc_foodstamp);
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
        if ((d.under18bk_perc) && (d.perc_foodstamp)) {
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
        .attr("id", "ymean5")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(ymean))
        .attr("y2", yScale(ymean));

      var xmeanline = svg.append("line")
        .attr("class", "meanline")
        .attr("id", "xmean5")
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

    var xmean = getMean(yearData, "flor_18afam");
    var ymean = getMean(yearData, "flor_foodstamp");

    console.log("MEANVA1", xmean);
    console.log("MEANVA2", ymean);

    console.log(circles);

    circles.attr("fill", function (d) {
      if (!(d.perc_foodstamp) || !(d.under18bk_perc)) {
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
      if (!isNaN(d.under18bk_perc)) {
        return xScale(+d.under18bk_perc);
      }
    })
    .attr("cy", function (d) {
      if (!isNaN(d.perc_foodstamp)) {
        return yScale(+d.perc_foodstamp);
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
      if ((d.perc_foodstamp) && (d.under18bk_perc)) {
        return dotOpacity;
      } else {
        return 0;
      }
    });

    d3.select("line#xmean5").transition()
        .attr("x1", xScale(xmean))
        .attr("x2", xScale(xmean))
        .duration(100)
        .ease("quad");

    d3.select("line#ymean5").transition()
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
    .text("Homeless students (%)");

  function mouseoverFunc(d) {
    myTooltip2
    .style("display", null) // this removes the display none setting from it
    .html("<p>" + "<span>" + d.county + "</span>" +
    "<br> Homeless students: " + "<em>" + d.perc_homeless + "%</em>" +
    "<br>African Americans under 18: <em>" + d.under18bk_perc + "%</em>" +
    "<br>Children receiving food stamps: " + "<em>" + d.perc_foodstamp + "%</em>" + "</p>");


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
