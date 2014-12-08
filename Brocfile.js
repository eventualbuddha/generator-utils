const compileModules = require('broccoli-compile-modules');

module.exports = compileModules('lib', {
  inputFiles: ['./index.umd.js'],
  output: '/generator-utils.js',
  format: 'bundle'
});
