const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
// const utils = require('./utils');
const config = require('../config');
const env = process.env.NODE_ENV || 'development';
const domain = require('../config/domain');
const cfg = config[env];

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  module: {},
  devtools: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env,
      'process.domain.manyi': JSON.stringify(domain['development']['manyi']),
      'process.domain.sso': JSON.stringify(domain['development']['sso']),
      'process.domain.oss': JSON.stringify(domain['development']['oss'])
    }),
    new FriendlyErrorsPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: cfg.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
});