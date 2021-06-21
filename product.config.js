/**
 * 将webpack配置跟vueprod.js解耦，vueprod.js仅用于控制打包流程
*/
const path = require('path');
const fs = require('fs');
// webpack
const webpack = require('webpack');
// glob
const glob = require('glob');
// Vue Loader
const VueLoaderPlugin = require('vue-loader/lib/plugin');
// HTML打包
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 固定IP
const internalIp = require('internal-ip');
// 前端静态化插件 
// const PrerenderSpaPlugin = require('prerender-spa-plugin');
// css分包
const MiniCssExtractPlugin = require('copy-webpack-plugin');
// 拷贝静态文件
const CopyWebpackPlugin = require('copy-webpack-plugin');
// node环境 用于构建
const nodeEnv = process.env.NODE_ENV || 'production';
// 配置 用于生产业务
const configName = process.env.config || 'production';
// 域名配置
const domainConfigs = require('./config/domain');
// 当前域名配置
const domain = domainConfigs[configName];
// 埋点通用配置
const trackConfigs = require('./config/track')
// 前端静态化
// const Renderer = PrerenderSpaPlugin.PuppeteerRenderer;
const DefinePlugin = webpack.DefinePlugin;
// webpack-serve 已经没人维护了。 webpack-dev-server还在更新，作者为同一人
const WebpackDevServer = require('webpack-dev-server');
const {fstat} = require('fs');
/**
 * 开发环境配置
 * @type {{port: number, host: *, open: boolean}}
*/
const serverConfig = {
  port: 8090, // 端口
  host: internalIp.v4.sync(), // 仅本地可改成host: 'localhost'
  open: true, // 编译完成后，是否自动打开浏览器 
  hot: true, // 启用热更新
  // 代理都在这里
  proxy:{}
}

/**
 * 运行产品的Web Server
*/
class ProductServer{
  constructor(options){
    if(!options || !options.compiler){
      throw new Error('必须传webpack compiler');
    }
    this.options = options || {};
    // 打开页面
    this.openPath = this.options.openPath || '';
    // 产品ID
    this.productId = options.productId;
    // webpack compiler实例
    this.compiler = options.compiler;
  }
  async run(){
    const cfg = serverConfig;
    let openPath = `http://${cfg.host}:${cfg.port}`;
    openPath +=this.openPath;
    let devOptions = {
      // content: [__dirname],
      hot: cfg.hot,
      host: cfg.host,
      port: cfg.port,
      open: cfg.open,
      openPage: openPath,
      proxy: serverConfig.proxy
    }
    console.log(`开始运行产品:${this.productId}`);
    const server = new WebpackDevServer(this.compiler, devOptions);
    return new Promise((resolve, reject)=>{
      server.listen(cfg.port,cfg.host,(err)=>{
        if(err){
          const reason = `本地测试web服务启动失败,失败原因：${err.toString()}`;
          console.log(reason);
          reject(new Error(reason));
        } else {
          console.log(`本地测试web服务启动，等待Webpack编译，地址：${openPath}`);
          resolve(devOptions)
        }
      })
    })
  }
}
/**
 * 
*/