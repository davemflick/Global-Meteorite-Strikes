
const w = 800;
const h= 400;

const map = d3.select(".mapCont")

const svg = map.append("svg")
   			.attr("width", w)
   			.attr("height", h);

const projection = d3.geoEquirectangular()
    .scale((w - 3) / (2 * Math.PI))
    .translate([w / 2, h / 2]);

const path = d3.geoPath()
    .projection(projection);


svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "globe")
    .attr("d", path);

svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

svg.append("use")
    .attr("class", "water")
    .attr("xlink:href", "#globe");

const gEl = svg.append("g");

const reduceMass = d3.scaleLinear()
				.domain([1000, 5000000])
				.range([2, 45])
				.clamp(true)

const colors = ['gray', 'blue', 'red'];

const colorScale = d3.scaleThreshold()
					.domain([1, 1000])
					.range(colors)

// Define div for tooltip
const tooltip = map.append('div').attr("class", "tooltip");

//Set zooming functionallity 
const zoom = d3.zoom()
		.scaleExtent([1,40])
		.on('zoom', zooming)


function zooming() {
  gEl.attr("transform", d3.event.transform); 
}

svg.call(zoom)

//Project the world with borders
const worldURL = "https://unpkg.com/world-atlas@1/world/50m.json";
d3.json(worldURL, function(error, world) {
  if(error){console.error(error)}

  gEl.insert("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

  gEl.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, (x, y) => {return x !== y} ))
      .attr("class", "border")
      .attr("d", path);

//Load Meteorite data inside world map data, to keep the data points on top of map

const URL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json"
d3.json(URL, (error, data)=>{
	if(error){console.error(error)};
	
	gEl.selectAll("circle")
		.data(data.features)
		.enter()
		.append("circle")
		.attr("class", "meteorites")
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
		.style('opacity', .5)
		.on('mouseover', (d)=> tooltip.style("visibility", "visible")
								.style("top", d3.event.pageY - 50 + 'px')
								.style("left", d3.event.pageX + 'px')
								.html(`Name: ${d.properties.name} 
									<br> Mass: ${d.properties.mass}
									<br> Fall: ${d.properties.fall}
									<br> Class: ${d.properties.recclass}
									<br> Latitude: ${d.properties.reclat}
									<br> Longitude: ${d.properties.reclong}`))
		.on('mouseout', (d)=> tooltipOut());

	//Remove meteorite data on mouseout
	const tooltipOut = (d) => {
		tooltip.style("visibility", "hidden")
	}

	
	})
})






