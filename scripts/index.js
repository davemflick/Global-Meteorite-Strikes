
var w = 800;
var h= 600;

var svg = d3.select(".mapCont").append("svg")
   			.attr("width", w)
   			.attr("height", h);

var projection = d3.geoMercator()
    .scale((w - 3) / (2 * Math.PI))
    .translate([w / 2, h / 2]);

var path = d3.geoPath()
    .projection(projection);


svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "globe")
    .attr("d", path);

svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#globe");

const reduceMass = d3.scaleLinear()
				.domain([1000, 5000000])
				.range([2, 45])
				.clamp(true)

const colors = ['gray', 'blue', 'red'];

const colorScale = d3.scaleThreshold()
					.domain([1, 1000])
					.range(colors)


//Project the world with borders
const worldURL = "https://unpkg.com/world-atlas@1/world/50m.json";
d3.json(worldURL, function(error, world) {
  if(error){console.error(error)}

  svg.insert("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, (x, y) => {return x !== y} ))
      .attr("class", "border")
      .attr("d", path);

//Load Meteorite data inside world map data, to keep the data points on top of map

const URL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json"
d3.json(URL, (error, data)=>{
	if(error){console.error(error)};
	console.log(data)
	
	svg.selectAll("circle")
		.data(data.features)
		.enter()
		.append("circle")
		.style("z-index", 100)
		.attr("cx", (d)=>{
			return projection([Number(d.properties.reclong), Number(d.properties.reclat)])[0]
		})
		.attr("cy", (d)=>{
			return projection([Number(d.properties.reclong), Number(d.properties.reclat)])[1]
		})
		.attr('r', (d)=> {
			 return reduceMass(d.properties.mass)
		})
		.attr("fill", (d)=> {
			return colorScale(d.properties.mass)
		})
		.style('opacity', .5);
	
	})
})