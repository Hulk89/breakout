
var env = new Environment()
var color_classes = ['background pixel', 'red pixel', 'skyblue pixel', 'green pixel']


var data = env.data;
var canvas = d3.selectAll(".canvas")

canvas.selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .attr('class', function(d) {
      return 'raw'
    })
      .selectAll("div")
      .data(d => d)
      .enter()
      .append('div')
      .attr("class", function(d) {
        return color_classes[d]
      })


function draw(data) {
  var canvas = d3.selectAll(".canvas")

  canvas.selectAll(".raw")
      .data(data)
        .selectAll(".pixel")
        .data(d => d)
        .attr("class", function(d) {
          return color_classes[d]
        })
}
