// data which need to be fetched
var value = 0;
var gaugeMaxValue = 100; 
// données à calculer 
var percentValue = value / gaugeMaxValue; 
////////////////////////
var needleClient;
(function(){
var barWidth, chart, chartInset, degToRad, repaintGauge,
    height, margin, numSections, padRad, percToDeg, percToRad, 
    percent, radius, sectionIndx, svg, totalPercent, width,
    valueText, formatValue, k;
  percent = percentValue;
  numSections = 1;
  sectionPerc = 1 / numSections / 2;
  padRad = 0.025;
  chartInset = 10;
  // Orientation of gauge:
  totalPercent = .75;
  el = d3.select('.chart-gauge');

  margin = {
    top: 0,
    right: 0,
    bottom:0,
    left: 0
  };

  width = el[0][0].offsetWidth - margin.left - margin.right;
  height = width;
  radius = Math.min(width, height) / 3.5;
  barWidth = 40 * width / 300;


  
  //Utility methods 
  
  percToDeg = function(perc) {
    return perc * 360;
  };

  percToRad = function(perc) {
    return degToRad(percToDeg(perc));
  };

  degToRad = function(deg) {
    return deg * Math.PI / 180;
  };

  // Create SVG element
  svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', (height + margin.top + margin.bottom) / 1.8 );

  // Add layer for the panel
  chart = svg.append('g').attr('transform', "translate(" + ((width) / 2 + margin.left) + ", " + ((height + margin.top) / 3) + ")");


  chart.append('path').attr('class', "arc chart-first");
  chart.append('path').attr('class', "arc chart-second");
  chart.append('path').attr('class', "arc chart-third");
    
  valueText = chart.append("text")
                    .attr('id', "Value")
                    .attr("font-size",16)
                    .attr("text-anchor","middle")
                    .attr("dy",".5em")
                    .style("fill", '#000000');
  formatValue = d3.format('1%');
  
  arc3 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
  arc1 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)

  repaintGauge = function () 
  {
    perc = 0.5;
    var next_start = totalPercent;
    arcStartRad = percToRad(next_start);

    arcEndRad = arcStartRad + percToRad(perc / 2);
    next_start += perc / 2;


    arc1.startAngle(arcStartRad).endAngle(arcEndRad);


    arcStartRad = percToRad(next_start);
    arcEndRad = arcStartRad + percToRad(perc / 2);
      
    arc3.startAngle(arcStartRad + padRad).endAngle(arcEndRad);

    chart.select(".chart-first").attr('d', arc1);
    chart.select(".chart-third").attr('d', arc3);

  }
/////////

  var Needle = (function() {

    //Helper function that returns the `d` value for moving the needle
    var recalcPointerPos = function(perc) {
      var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
      thetaRad = percToRad(perc / 2);
      centerX = 0;
      centerY = 0;
      topX = centerX - this.len * Math.cos(thetaRad);
      topY = centerY - this.len * Math.sin(thetaRad);
      leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
      leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
      rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
      rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
     
        
        return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
        
        
        
        
    };

    function Needle(el) {
      this.el = el;
      this.len = width / 4;
      this.radius = this.len / 14;
    }

    Needle.prototype.render = function() {
      this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
        
        
        
        
      return this.el.append('path').attr('class', 'needle').attr('id', 'client-needle').attr('d', recalcPointerPos.call(this, 0));
        
       
    };

    Needle.prototype.moveTo = function(perc) {
      var self,
          oldValue = this.perc || 0;
      this.perc = perc;
      self = this;


      if (oldValue!=perc){

           // Reset pointer position
      this.el.transition().delay(100).ease('quad').duration(200).select('.needle').tween('reset-progress', function() {
        return function(percentOfPercent) {
          var progress = (1 - percentOfPercent) * oldValue;
          repaintGauge(progress);
          return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
        };
      });

      this.el.transition().delay(300).ease('bounce').duration(1500).select('.needle').tween('progress', function() {
        return function(percentOfPercent) {
          var progress = percentOfPercent * perc;
          repaintGauge(progress);
          var thetaRad = percToRad(progress / 2);
          var textX = - (self.len + 45) * Math.cos(thetaRad);
          var textY = - (self.len + 45) * Math.sin(thetaRad);

          valueText.text(formatValue(progress))
            .attr('transform', "translate("+textX+","+textY+")")

          return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
        };
      });


      }

    };

    return Needle;

  })();
    
 
    
  needle = new Needle(chart);
  needle.render();
  needle.moveTo(percent);
  needle.moveTo(0.5);

})();
