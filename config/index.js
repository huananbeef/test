// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')
// 获取IP地址
var internalIp = require('internal-ip');

module.exports = {
  production: {
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname,'../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: false, // 生产环境是否生成sourceMap文件
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  development: {
    port: 8088,
    host: internalIp.v4.sync(), // 仅本地可改成host: 'localhost
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
    cssSourceMap: false
  }
}