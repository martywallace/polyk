const pkg = require('./package.json')

export default {
  entry: 'index.js',
  moduleName: 'PolyK',
  sourceMap: true,
  targets: [
    { dest: pkg['browser'], format: 'umd' }
  ]
}
