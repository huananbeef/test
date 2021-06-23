const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
// const utils = require('./utils');
const config = require('../config');
const env = process.env.NODE_ENV || 'development';
const cfg = config[env];

function resolve(dir){
  return path.join(__dirname, '..',dir);
}
module.exports = {
  output: {
    publicPath: cfg.assetsPublicPath
  },
  externals:{},
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: ['node_modules'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: []
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
