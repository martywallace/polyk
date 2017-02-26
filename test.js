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

/**
 * Convert GeoJSON Polygon to Polygon
 *
 * @param {Feature<Polygon>} polygon
 * @returns {number[]} Array Polygon
 */
function convertToArray (polygon) {
  return [].concat.apply([], polygon.geometry.coordinates[0])
}

/**
 * Convert Array Polygon to FeatureCollection GeoJSON Polygon
 *
 * @param {number[]} array
 * @returns {FeatureCollection<Polygon>}
 */
function convertToGeoJSON (array) {
  const geojson = featureCollection([])
  array.forEach((item) => {
    var coords = chunk(item, 2)
    coords.push(coords[0])
    geojson.features.push(turf.polygon([coords]))
  })
  return geojson
}

test('PolyK.Slice', t => {
  // Define fixtures
  const polygon = fixtures['polygon']
  const line = fixtures['line']
  const start = line.geometry.coordinates[0]
  const stop = line.geometry.coordinates[1]
  line.properties['stroke'] = '#f0f'
  line.properties['stroke-width'] = 6

  // Slice
  const sliced = PolyK.Slice(convertToArray(polygon), start[0], start[1], stop[0], stop[1])
  const results = convertToGeoJSON(sliced)
  results.features.push(line)

  // Save Results
  if (process.env.REGEN) {
    write.sync(directories.out + 'slice.geojson', results)
  }

  t.deepEquals(results, load.sync(directories.out + 'slice.geojson'))
  t.end()
})

test('PolyK.Raycast', t => {
  const polygon = fixtures['polygon']
  const start = fixtures['start'].geometry.coordinates
  const direction = fixtures['direction'].geometry.coordinates

  const raycast = PolyK.Raycast(convertToArray(polygon), start[0], start[1], direction[0], direction[1])

  if (process.env.REGEN) {
    write.sync(directories.out + 'raycast.json', raycast)
  }
  t.deepEquals(raycast, load.sync(directories.out + 'raycast.json'))
  t.end()
})
