const test = require('tape')
const fs = require('fs')
const path = require('path')
const load = require('load-json-file')
const write = require('write-json-file')
const chunk = require('lodash.chunk')
const turf = require('@turf/helpers')
const featureCollection = require('@turf/helpers').featureCollection
const PolyK = require('.')

const directories = {
  in: path.join(__dirname, 'test', 'in') + path.sep,
  out: path.join(__dirname, 'test', 'out') + path.sep
}

const fixtures = {}
fs.readdirSync(directories.in).forEach(filename => {
  const name = path.parse(filename).name
  fixtures[name] = load.sync(directories.in + filename)
})

test('PolyK.Slice', t => {
  // Define fixtures
  const polygon = fixtures['polygon']
  const line = fixtures['line']
  const start = line.geometry.coordinates[0]
  const stop = line.geometry.coordinates[1]
  line.properties['stroke'] = '#f0f'
  line.properties['stroke-width'] = 6

  // Prepare Polygon
  const polyCoordsFlattened = [].concat.apply([], polygon.geometry.coordinates[0])

  // Slice
  const sliced = PolyK.Slice(polyCoordsFlattened, start[0], start[1], stop[0], stop[1])

  // Convert results to GeoJSON
  const results = featureCollection([])
  sliced.forEach(function (item) {
    var coords = chunk(item, 2)
    coords.push(coords[0])
    results.features.push(turf.polygon([coords]))
  })
  results.features.push(line)

  // Save Results
  if (process.env.REGEN) {
    write.sync(directories.out + 'slice.geojson', results)
  }

  t.deepEquals(results, load.sync(directories.out + 'slice.geojson'))
  t.end()
})
