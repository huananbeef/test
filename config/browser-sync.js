/**
 * 需要先全局安装 browser-sync
*/
'use strict'
const proxy = require('http-proxy-middleware');
const history = require('connect-history-api-fallback');
const config = require('./index');
const cfg = config['development'];

const middleware = [];
if(cfg.proxyTable){
  Object.keys(cfg.proxyTable).forEach((item)=>{
    middleware.push(proxy([item],{target:cfg.proxyTable[item].target, changeOrigin: cfg.proxyTable[item].changeOrigin}))
  })
  middleware.push(history())
}
module.exports = {
  server:{
    baseDir: './dist',
    middleware: middleware
  },
  port: cfg.port, // 默认端口
  ui: false, // 关闭Web配置页面
  host: cfg.host,
  open: cfg.autoOpenBrowser
}