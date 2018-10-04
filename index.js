var osm_layer	= new ol.layer.Tile({ source: new ol.source.OSM() })
//var map_view	= new ol.View({ center: ol.proj.fromLonLat([27.34, 53.74]), zoom: 6 })
var map_view	= new ol.View({ center: ol.proj.fromLonLat([0, 0]), zoom: 0 })
var map	        = new ol.Map({ target: 'map' })
map.setView(map_view)
map.addLayer(osm_layer)

var vectorSource = new ol.source.Vector({

});
var vector = new ol.layer.Image({
  source: new ol.source.ImageVector({
      source: vectorSource,
      style: new ol.style.Style({
          fill: new ol.style.Stroke({
              color: '#efefef',
              width: 1
          }),
          stroke: new ol.style.Stroke({
              color: '#fff',
              width: 1
          })
      })
  })
});
map.addLayer(vector)


const openWeatherMapApiUrl = 'http://api.openweathermap.org/data/2.5'
const openWeatherMapAppId = '4fc2ed41d4f0d27b2a672cb20404d4bf'
var s
const bbox = [-180, -90, 180, 90]
const zoomLevel = +window.location.hash.substr(1) || 6
map.once('precompose', async function() {
  s = init_ol_d3(this)
  const url = `${openWeatherMapApiUrl}/box/city?bbox=${bbox.join(',')},${zoomLevel}&appid=${openWeatherMapAppId}`
  const resp = await fetch(url, window.location.protocol === 'file:' ? {cache: 'force-cache'} : undefined)
  openWeatherMapResponse = await resp.json()
	openWeatherMapResponse.list.forEach(weath => {
    weath.coord.lonLat = [weath.coord.Lon, weath.coord.Lat]
	})
	console.log(openWeatherMapResponse.list)
  draw()
})

var l = [ [27.55000, 53.91667], [30.03333, 52.90000] ]


drawRoute = d3.line()
	.x(function(lonlat) { return s(lonlat)[0] })
	.y(function(lonlat) { return s(lonlat)[1] })

// http://api.openweathermap.org/data/2.5/box/city?bbox=20,51,34,57,5&appid=4fc2ed41d4f0d27b2a672cb20404d4bf


function redrawPolygon(polygon) {
  polygon
    .attr("d", d => d ? "M" + d.map(lonlat => s(lonlat)).join("L") + "Z" : null)
    .style('fill', d => {
       if (!d) return null
       const tempOffset = 10
       const tempScale = 1/40
       const temp = d.data.main.temp - tempOffset
       const color = temp > 0 ? `rgba(255, 0, 0, ${temp*tempScale})` : `rgba(0, 0, 255, ${-temp*tempScale})`
       //console.log(color, d.data.name, d.data.main.temp)
       return color
    })
    .on('click', function(d) {
      //console.log('args', arguments)
      //d3.select(this).style('stroke-width', '4px')
      const hintText = `${d.data.name}: ${d.data.main.temp > 0 ? '+' : ''}${d.data.main.temp}°C`
      //alert(hintText)
      d3.select('.info')
        .html(hintText)
    })
}

function redrawSite(site) {
  site
      .attr("cx", d => s(d.coord.lonLat)[0])
      .attr("cy", d => s(d.coord.lonLat)[1]);
}

function draw() {
  d3.select('body').append('div')
    .classed('info', true)
    .style('position', 'absolute')
    .style('top', '1rem')
    .style('left', '1rem')
    .style('font-family', 'sans-serif')
    .style('font-size', '2rem')
    .html('click to get temp')
  const c = ol.proj.toLonLat(map.getView().getCenter())
  const extent = map.getView().calculateExtent()
  //const e1 = ol.proj.toLonLat(extent.slice(0, 2))
  //const e2 = ol.proj.toLonLat(extent.slice(2, 4))
  const e1 = [bbox[0], bbox[1]]
  const e2 = [bbox[2], bbox[3]]
  const voronoi = d3.geoVoronoi()
    //.extent([e1, e2])
    .x(weath => weath.coord.Lon)
    .y(weath => weath.coord.Lat)
  featureColl = voronoi(openWeatherMapResponse.list).polygons()
  polygons = [] 
  featureColl.features.forEach(feat => {
    const coords = feat.geometry.coordinates[0]
    let minx = Infinity
    let maxx = -Infinity
    for (let i = 0; i < coords.length; i++) {
      const [ x, y ] = coords[i]
      minx = Math.min(minx, x)
      maxx = Math.max(maxx, x)
    }
    if (maxx - minx > 240) return
    coords.data = feat.properties.site    
    polygons.push(coords)
  })
  polygons2 = d3.voronoi().extent([e1, e2]).x(weath => weath.coord.Lon).y(weath => weath.coord.Lat)(openWeatherMapResponse.list).polygons()
  console.log(polygons)

  var g = d3.select('#map .d3-layer svg > g')
//  path = g.append('path')
//    .classed('route', true)
//    .attr('d', drawRoute(l))

// const fullFeaturesArr = []
// featureColl.features.forEach(feat => fullFeaturesArr.push(feat))
// featureColl.features = fullFeaturesArr
// var format = new ol.format.GeoJSON();
// var olfeats = format.readFeatures(featureColl, {featureProjection:"EPSG:3857"});    
//vectorSource.addFeatures(olfeats);
  
  var polygon = g.append("g")
    .attr("class", "polygons")
    .selectAll("path")
    .data(polygons)
    .enter().append("path")
    .call(redrawPolygon);

  var site = g.append("g")
    .attr("class", "sites")
    .selectAll("circle")
    .data(openWeatherMapResponse.list)
    .enter().append("circle")
    .attr("r", 0.1)
    .call(redrawSite); 
}