	function segColor(c){ return {
	"Trump" : "#FF0000",
	"Clinton":"#3399FF",
	"Autre": "#808080", 
	"Blanc": "#000000"}[c]; }
	function tooltipHtml(n, d){	/* function to create html content string in tooltip div. */
		return "<h4>"+n+"</h4><table>"+
			"<tr><td>Clinton</td><td>"+(d.Clinton)+"</td></tr>"+
			"<tr><td>Trump</td><td>"+(d.Trump)+"</td></tr>"+
			"<tr><td>Autre</td><td>"+(d.Autre)+"</td></tr>"+
			"<tr><td>Blanc</td><td>"+(d.Blanc)+"</td></tr>"+
			"</table>";
	}
	var sampleData ={};	/* Sample random data. */	
	var myVar = setInterval(updateData,30000)
/*	function updateData() {	
	d3.json("donneesVotes2.json", function(error, data) {
	d3.select("#statesvg").remove()
	console.log(data)
	d3.select("#map")
	.append("svg")
	.attr("id","statesvg")
	.attr("width",960)
	.attr("height",100)
	uStates.draw("#statesvg", data, tooltipHtml);
    });*/};
	/* draw states on id #statesvg */	
	d3.select(self.frameElement).style("height", "200px"); 
