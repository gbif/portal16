### Steps of creating map json for the GBIF Network page.

The country borders change from time to time. Here I document the steps of creating the geojson for use on the GBIF Network page so the map can be easier updated.

Source data from [Natural Earth](http://www.naturalearthdata.com/downloads/50m-cultural-vectors/)
Procedures following [Command-Line Cartography series](https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c#.rw5l589jn) by [Mike Bostock](https://bost.ocks.org/mike/).

Install necessary tools
```
$ npm install -g d3-geo-projection shapefile ndjson-cli

```
Convert shapefile to GeoJSON
```
$ shp2json ne_50m_admin_0_countries.shp -o ./ne_countries.json
```
If you want to filter out any entities at this point, for example, Antarctica:
```$ ogr2ogr -f GeoJSON -where "ISO3 <> 'ATA'" ne_countries.json ne_50m_admin_0_countries.shp```

Re-project to Robinson projection
```
$ geoproject 'd3.geoRobinson().rotate([0,0]).fitSize([960, 480], d)' < ne_countries.json > ne_countries-robinson.json
```
Generate SVG to verify the result
```
$ geo2svg -w 960 -h 480 < ne_countries-robinson.json > ne_countries-robinson.svg
```
Split features for processing and attribute joining
```
$ ndjson-split 'd.features' < ne_countries-robinson.json > ne_countries-robinson.ndjson
```
Filter out Antarctica
```$ ndjson-filter 'd.properties.iso_a2 !== "AQ"' < ne_countries-robinson.ndjson > ne_countries-robinson-filtered.ndjson```

Add ISO2 property
```$ ndjson-map 'd.properties.ISO2 = d.properties.iso_a2, d' < ne_countries-robinson-filtered.ndjson > ne_countries-robinson-iso2.ndjson```

Convert GeoJSON to TopoJSON
```$ geo2topo -n tracts=ne_countries-robinson-iso2.ndjson > ne_countries-robinson-topo.json```
Simplify TopoJSON
```$ toposimplify -p 1 -f < ne_countries-robinson-topo.json > ne_countries-robinson-simple.json```
Quantize TopoJSON
```$ topoquantize 1e5 < ne_countries-robinson-simple.json > ne_countries-robinson-quantize.json```

The quantized JSON is c-robinson-quantized-topo.json being used.

