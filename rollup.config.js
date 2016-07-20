import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

var pkg = require('./package.json');

export default {
  entry: 'src/index.js',
  plugins: [babel(babelrc())],
  targets: [
    {
      format: 'es',
      dest: pkg['jsnext:main']
    },
    {
      format: 'umd',
      moduleName: 'GU',
      dest: pkg['main']
    }
  ]
};
