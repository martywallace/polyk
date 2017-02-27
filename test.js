const fs = require('fs')
const path = require('path')
const PolyK = require('.')

const directories = {
  in: path.join(__dirname, 'test', 'in') + path.sep,
  out: path.join(__dirname, 'test', 'out') + path.sep
}
const polygon = require(directories.in + 'polygon.json')

test('Slice', () => {
  const start = [134.208984375, -4.390228926463384]
  const end = [129.0234375, -43.51668853502907]
  const sliced = PolyK.Slice(polygon, start[0], start[1], end[0], end[1])
  if (process.env.REGEN) { fs.writeFileSync(directories.out + 'sliced.json', JSON.stringify(sliced, null, 2)) }
  expect(sliced).toEqual(require(directories.out + 'sliced.json'))
})

test('Raycast', () => {
  const polygon = require(directories.in + 'polygon.json')
  const start = [135, -25]
  const direction = [110, -10]
  const raycast = PolyK.Raycast(polygon, start[0], start[1], direction[0], direction[1])
  if (process.env.REGEN) { fs.writeFileSync(directories.out + 'raycast.json', JSON.stringify(raycast, null, 2)) }
  expect(raycast).toEqual(require(directories.out + 'raycast.json'))
})

test('Triangulate', () => {
  const triangulate = PolyK.Triangulate(polygon)
  if (process.env.REGEN) { fs.writeFileSync(directories.out + 'triangulate.json', JSON.stringify(triangulate, null, 2)) }
  expect(triangulate).toEqual(require(directories.out + 'triangulate.json'))
})

test('ContainsPoint', () => {
  const polygon = require(directories.in + 'polygon.json')
  const inside = [135, -25]
  const outside = [102, -16]
  expect(PolyK.ContainsPoint(polygon, inside[0], inside[1])).toBe(true)
  expect(PolyK.ContainsPoint(polygon, outside[0], outside[1])).toBe(false)
})
