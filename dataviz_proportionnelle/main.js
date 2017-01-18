$(document).bind("pageinit", init);

var chartMargin = {top: 20, right: 20, bottom: 30, left: 80},
	chartWidth = 300 - chartMargin.left - chartMargin.right,
	chartHeight = 200 - chartMargin.top - chartMargin.bottom;

var chartColor = d3.scale.ordinal()
	.domain(["Dem","Toss up","GOP"])
	.range(["#2166AC","#B7B7B7","#B2182B"]);

var x = d3.scale.ordinal()
	.domain(["Dem","GOP","Toss up"])
	.rangeRoundBands([0, chartWidth], .1)

var y = d3.scale.linear()
	.domain([0, 538])
	.range([chartHeight, 0]);

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.tickValues([270, 538]);

var stateColor = d3.scale.linear()
	.clamp(true)
	.domain([-7,0,7])
	.range(["#2166AC","#B7B7B7","#B2182B"]);

var dateFormatter = d3.time.format("%b %d, %Y");

var selectedState = null;
var transDur = 200;
var electionDataDate = 1199163600000, // Jan 01, 2008 (2008 election data)
	firstDate = electionDataDate,
	lastDate = 0;

var totalVotes = [
	{"party": "Dem", "votes": 0},
	{"party": "GOP", "votes": 0},
	{"party": "Toss up", "votes": 0}
];

function init() {
	var w = 650, h = 400;
	
	var path = d3.geo.path();
	
	var cartogramSvg = d3.select("#cartogram").append("svg:svg").attr("width", w).attr("height", h);

	var donnees_vote2 = d3.json("donnees_vote2.json", function(donnees_vote2) {
		//console.log(donnees_vote2)
		return donnees_vote2;
	})

	//console.log(donnees_vote2)

	var rootData = $.getJSON( "donnees_vote2.json", function(json) {
  		//console.log( "JSON Data: " + json.Alaska.Autre );
  		return "JSON Data: " + json.Alaska.Autre;
 	});

	setInterval(function(){
		//console.log(rootData.responseText)
	
		d3.json("us-states.json", function(states) {
			var nodes = [], links = [];
			var temp;
			var maxVotes = 55; //CA
			var baseArea = 5000; //base pixel area for rescaling states
			var i = 0;

			//console.log(states.features[3].properties)
			
			// compute new area for each state
			states.features.forEach(function(d, j) {
				d.properties.origArea = path.area(d.geometry);
				d.properties.newArea = baseArea * d.properties.votes / maxVotes;
				
				// put polls in chronological order
				d.properties.polls = d.properties.polls.reverse();
				
				// indicate the initial selection is the most recent poll of this state
				d.properties.selectedPoll = d.properties.polls.length -1;
				
				//d.properties.polls.length is always equal to 1 for us
				for (i = 0; i < d.properties.polls.length; ++i) {
					// the first "poll" is the 2008 election with Obama v. McCain
					// all other polls were in 2012
					var pollDate = new Date(d.properties.polls[i].date + (i == 0 ? ",2008" : ",2012"));
					d.properties.polls[i].date = pollDate;
					
					if (i > 0 && (pollDate.getTime() < firstDate || firstDate == electionDataDate))
						firstDate = pollDate.getTime();
					if (pollDate.getTime() > lastDate)
						lastDate = pollDate.getTime();
				}
			});
			
			// Election 2008/2012 toggle
			/*$("input[type='radio']").bind( "change", function(event, ui) {
				if (event.target.value == "election2008") {
					$("#date-slider").slider("disable");
					updatePollSelection(electionDataDate);
					updateStateColors();
					stateClick(selectedState);
					updateChart();
				} else {
					$("#date-slider").slider("enable");
					updatePollSelection($("#date-slider").attr("value"));
					updateStateColors();
					stateClick(selectedState);
					updateChart();
				}
			});*/
			
			// ensure the 2012 radio button is checked and the slider is enabled
			/*$("input#election-2008-radio").attr("checked",false).checkboxradio("refresh");
			$("input#election-2012-radio").attr("checked",true).checkboxradio("refresh");
			$("#date-slider").slider("enable");*/
			
			// update the slider with the min and max dates
			/*$("#date-slider")
				.attr("min", firstDate)
				.attr("value", lastDate)
				.attr("max", lastDate)
				.slider("refresh");
			$("#date-slider").change(function(event) {
				updatePollSelection(+event.target.value);
				updateStateColors();
				stateClick(selectedState);
				updateChart();
			});*/
			
			/*d3.select("#date-slider-min-label").text(dateFormatter(new Date(firstDate)));
			d3.select("#date-slider-max-label").text(dateFormatter(new Date(lastDate)));
			d3.select("#date-slider-value-label").text(dateFormatter(new Date(lastDate)));*/
			
			states.features.forEach(function(d, i) {
				//console.log(d);
				//throw new Error("Stop!");
				var centroid = path.centroid(d);
				centroid.x = centroid[0];
				centroid.y = centroid[1];
				centroid.feature = d;
				nodes.push(centroid);

				//if(d.properties.name == );
				if(rootData.responseText != null) {
					results_to_jsobject = JSON.parse(rootData.responseText);
					//console.log(results_to_jsobject);
					//throw new Error("Stop!");
					for (var state2 in results_to_jsobject) {
						//console.log(results_to_jsobject[state2])
						//console.log(d)
						if(d.properties.name == state2) {
							d.properties.polls[0].dem = results_to_jsobject[state2]["Clinton"]
							d.properties.polls[0].gop = results_to_jsobject[state2]["Trump"]
						}
					}
					//throw new Error("Stop!");
				}
			});

			
			
			var node = cartogramSvg.selectAll("g")
				.data(nodes)
				.enter()
				.append("svg:g")
				.append("svg:path")
				.attr("class", "state")
				.attr("transform", function(d) {
					//console.log("d.feature.properties.name", d.feature.properties.name)
					return d.feature.transform;
				})
				.attr("d", function(d) { return path(d.feature); })
				.attr("title", function(d) { return d.feature.properties.name + ": " + d.feature.properties.votes + " votes"; })
				.style("stroke-width", function(d) { return 1 / Math.sqrt(d.feature.properties.newArea/d.feature.properties.origArea); })
				.style("fill", function(d) {
					var selectedPoll = d.feature.properties.polls[d.feature.properties.selectedPoll];
					var diff = selectedPoll.gop - selectedPoll.dem;
					return stateColor(diff);
				})
				.on("click", function(d) {
					d3.selectAll("path.state").classed("selected", false);
					d3.select(this).classed("selected", true);
					stateClick(d);
				});
			
			// find the poll for each state and calculate votes
			//updatePollSelection($("#date-slider").attr("value"));
			
			/*var chartSvg = d3.select("#vote-chart").append("svg")
				.attr("width", chartWidth + chartMargin.left + chartMargin.right)
				.attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
				.append("g")
				.attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
			
			chartSvg.append("g")
				.attr("class", "title")
				.append("text")
				.attr("x", 25)
				.text("US Electoral Votes");
			
			chartSvg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + chartHeight + ")")
				.call(xAxis);
			
			chartSvg.append("g")
				.attr("class", "y axis")
				.call(yAxis);
			
			chartSvg.selectAll(".bar").data(totalVotes)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return x(d.party); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.votes); })
				.attr("height", function(d) { return chartHeight - y(d.votes); })
				.attr("title", function(d) { return d.votes + " votes"; })
				.style("fill", function(d) { return chartColor(d.party); });*/
		});

	}, 3000);	
}

function updatePollSelection(date) {
	var currDate = new Date(+date);
	
	// update slider label
	if (date == electionDataDate) {
		d3.select("#date-slider-value-label").text("Election results: ");
		d3.select("#date-slider-value").text("2034");
	} else {
		d3.select("#date-slider-value-label").text("Results: ");
		d3.select("#date-slider-value").text(dateFormatter(currDate));
	}
	
	totalVotes[0].votes = 0;
	totalVotes[1].votes = 0;
	totalVotes[2].votes = 0;
	
	d3.selectAll("path.state").each(function(d) {
		var i = 0;
		var poll;
		
		// find the first date >= currently selected date
		// if no poll after selected date, use the most recent poll
		// if no poll available, uses Election 2008
		for (i = 0; i < d.feature.properties.polls.length; ++i) {
			poll = d.feature.properties.polls[i];
			if (poll.date > currDate) {
				break;
			}
			d.feature.properties.selectedPoll = i;
		}
		
		// recompute the electoral vote totals
		if (poll.dem - poll.gop > 2) { // Dem winning
			totalVotes[0].votes += d.feature.properties.votes;
		} else if (poll.gop - poll.dem > 2) { //GOP winning
			totalVotes[1].votes += d.feature.properties.votes;
		} else { //toss up
			totalVotes[2].votes += d.feature.properties.votes;
		}
	});
}

function updateStateColors() {
	d3.selectAll("path.state").transition()
		.duration(transDur)
		.style("fill", function(d) {
			var poll = d.feature.properties.polls[d.feature.properties.selectedPoll];
			return stateColor(poll.gop - poll.dem);
		});
}

function updateChart() {
	d3.selectAll(".bar").data(totalVotes)
		.transition().duration(transDur)
		.attr("y", function(d) { return y(d.votes); })
		.attr("height", function(d) { return chartHeight - y(d.votes); })
		.attr("title", function(d) { return d.votes + " votes"; });
}

function stateClick(d) {
	if (d === null) return;
	
	var selectedPoll = d.feature.properties.polls[d.feature.properties.selectedPoll];
	var detailsHtml = "<h3>" + d.feature.properties.name + "</h3>";
	//detailsHtml += "<p><!--span class='label'># of votes: </span-->" + d.feature.properties.votes + "</p>";
	//detailsHtml += "<p><span class='label'># of votes:  </span>" + (d.feature.properties.polls.length -1) + "</p>";
	//detailsHtml += "<p><!--span class='label'>" + "Displaying poll:  </span-->" + selectedPoll.pollster + "</p>";
	//detailsHtml += "<p><span class='label'>" + "Date conducted:  </span>" + dateFormatter(selectedPoll.date) + "</p>";
	detailsHtml += "<p><span class='label'>" + "# Dem:  </span>" + selectedPoll.dem + "</p>";
	detailsHtml += "<p><span class='label'>" + "# GOP:  </span>" + selectedPoll.gop + "</p>";
	d3.select("#state-details").html(detailsHtml);
	
	selectedState = d;
}