const pkg = require('./package.json')

export default {
  entry: 'index.js',
  moduleName: 'PolyK',
  sourceMap: true,
  targets: [
    { dest: pkg['main'], format: 'cjs' },
    { dest: pkg['browser'], format: 'umd' },
    { dest: pkg['module'], format: 'es' }
  ]
}
