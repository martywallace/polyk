const fs = require('fs')
const test = require('tape')
const path = require('path')
const PolyK = require('.')

const directories = {
  in: path.join(__dirname, 'test', 'in') + path.sep,
  out: path.join(__dirname, 'test', 'out') + path.sep
}

test('PolyK.Slice', t => {
  // Define fixtures
  const polygon = require(directories.in + 'polygon.json')
  const start = [134.208984375, -4.390228926463384]
  const end = [129.0234375, -43.51668853502907]

  // Slice
  const sliced = PolyK.Slice(polygon, start[0], start[1], end[0], end[1])

  // Save Results
  if (process.env.REGEN) {
    fs.writeFileSync(directories.out + 'sliced.json', JSON.stringify(sliced, null, 2))
  }

  // Tests
  t.deepEquals(sliced, require(directories.out + 'sliced.json'))
  t.end()
})

test('PolyK.Raycast', t => {
  // Define fixtures
  const polygon = require(directories.in + 'polygon.json')
  const start = [135, -25]
  const direction = [110, -10]

  // Raycast
  const raycast = PolyK.Raycast(polygon, start[0], start[1], direction[0], direction[1])

  // Save Results
  if (process.env.REGEN) {
    fs.writeFileSync(directories.out + 'raycast.json', JSON.stringify(raycast, null, 2))
  }

  // Tests
  t.deepEquals(raycast, require(directories.out + 'raycast.json'))
  t.end()
})
