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
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
    console.log('----this.options.openPath----', this.options.openPath)
    // 打开页面
    this.openPath = this.options.openPath || '';
    // 产品ID
    this.productId = options.productId;
    // webpack compiler实例
    this.compiler = options.compiler;
  }
  async run(){
    const cfg = serverConfig;
    console.log('----------', serverConfig)
    let openPath = `http://${cfg.host}:${cfg.port}/`;
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
 * 产品Webpack配置
 * 默认都为production配置
*/
class ProductWebpack {
  constructor(option){
    const {mode = 'production', publicPath = '/', products, configName, site} = option;
    this.option = option;
    this.mode = mode;
    this.configName = configName || this.mode; // 业务配置 development test production 用于配置开发环境、测试环境、生产环境
    this.publicPath = publicPath; // 发布路径，由于没有设置路由中的base，publicPath默认都为'/'
    this.products = products; // 主要包含入口文件配置的产品配置
    this.site = site; // 站点，当前主要有 anyi、yunbao、sale（电销） 三个，历史原因，anyi的并没有发到dist目录
  }
  /**
   * 基础Webpack配置
   * @returns {Object}
  */
 get baseConfig(){
   return {
     mode: 'production',
     entry: {},
     output: {
       publicPath: '/',
       path: path.resolve(__dirname, './dist'),
       filename: 'static/js/[name].[contenthash:8].js',
       chunkFilename: 'static/js/[name].[contenthash:8].js'
     },
     optimization:{
       runtimeChunk: {
         // name: entrypoint => `${entrypoint.name}/js/runtime`
         name: 'manifest'
       },
       splitChunks: {
         cacheGroups: {
           commons: {
             test: /[\\/]node_modules[\\/]/,
             name: 'vendor',
             chunks: 'all'
           }
         }
       }
     },
     module: {
       rules: []
     },
     resolve: {
       extensions: ['.js','.vue','.json'],
       modules: ['node_modules'],
       alias: {
         'vue$': 'vue/dist/vue.runtime.esm.js',
         '@': path.resolve('./src')
       }
     },
     plugins: [
       // VueLoader是插件形式
       new VueLoaderPlugin(),
       new webpack.ContextReplacementPlugin(/moment[/\\]locale/, /zh-cn/)
     ]
   }
 }
 /**
  * 获取CssLoader配置
  * @param cssOption
  * @returns {*[]}
 */
 getCssLoader(cssOption){
   const {mode = 'production', sourceMap = false} = cssOption;
   let styleLoaders = mode === 'production' ? [MiniCssExtractPlugin.loader] : ['vue-style-loader'];
   const postcssLoader = mode === 'production' ? [{
    loader: 'postcss-loader',
    options: {
      sourceMap: sourceMap
    }
   }] : [];
   const cssLoader = [{
     loader: 'css-loader',
     options: {
       sourceMap: sourceMap,
       minimize: mode === 'production',
       importLoaders: 2
     }
   }];
   const sassLoader = [{
     loader: 'sass-loader',
     options: {
       sourceMap: sourceMap
     }
   }];
   return [
    {
      test: /\.css/,
      use: styleLoaders.concat(cssLoader).concat(postcssLoader)
    }, {
      test: /\.scss/,
      // 先styleLoader，再cssLoader、postcssLoader、sassLoader
      use: styleLoaders.concat(cssLoader).concat(postcssLoader).concat(sassLoader)
    }
   ]
 }
/**
 * 获取Webpack Rule
 * @param ruleOption rule配置
 * @returns {*[]}
*/
getRules(ruleOption){
  const {src, mode } = ruleOption;
  // 默认只有开发环境有sourceMap
  const sourceMap = mode === 'development';
  let result = [
    {
      test: /\.vue$/,
      type: 'javascript/auto',
      use: [{
        loader: 'vue-loader'
      }]
    },{
      test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        },
        include: [path.resolve('./src'), path.resolve('/node_modules/element-ui/src'), path.resolve('/node_modules/element-ui/packages')]
    },
    /* config.module.rule('images') */
    {
      test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
      include: [path.resolve('./src')],
      use: [
        /* config.module.rule('images').use('url-loader') */
        {
          loader: 'url-loader',
          options: {
            limit: 4096,
            fallback: {
              loader: 'file-loader',
              options: {
                name: `${src}/images/[name].[hash:7].[ext]`
              }
            }
          }
        }
      ]
    },
    /* config.module.rule('svg') */
    {
      test: /\.(svg)(\?.*)?$/,
      include: [path.resolve('./src')],
      use: [
        /* config.module.rule('svg').use('file-loader') */
        {
          loader: 'file-loader',
          options: {
            name: `${src}/images/[name].[hash:7].[ext]`
          }
        }
      ]
    },
    /* config.module.rule('media') */
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      include: [path.resolve('./src')],
      use: [
        /* config.module.rule('media').use('url-loader') */
        {
          loader: 'url-loader',
          options: {
            limit: 4096,
            fallback: {
              loader: 'file-loader',
              options: {
                name: `${src}/media/[name].[hash:7].[ext]`
              }
            }
          }
        }
      ]
    },
    /* config.module.rule('fonts') */
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
      use: [
        /* config.module.rule('fonts').use('url-loader') */
        {
          loader: 'url-loader',
          options: {
            limit: 4096,
            fallback: {
              loader: 'file-loader',
              options: {
                name: `${src}/fonts/[name].[hash:7].[ext]`
              }
            }
          }
        }
      ]
    }
  ]
  const cssLoader = this.getCssLoader({
    sourceMap, mode
  });
  return result.concat(cssLoader)
}
  /**
   * 获取DefinePluginConfig 编译时可以配置的全局常量
   * @param configName 业务配置
   * @param productId 产品ID
   * @returns {webpack.DefinePlugin}
   */
  getDefinePluginConfig ({configName = 'production', productId}){
    let params = {
      'process.env': {
        // NODE_ENV: JSON.stringify(nodeEnv), webpack mode 会自动设置process.env
        BASE_URL: '"/"'
      },
      'process.domain': {},
      'TRACK_CONFIG': ''
    };
    let domainConfig = domainConfigs[configName];
    Object.keys(domainConfig).forEach(key => {
      params['process.domain'][key] = JSON.stringify(domainConfig[key]);
    });
    let productTrack = '';
    // 埋点无测试环境 生产环境之分
    const trackKey = configName === 'test' ? 'development' : configName;
    let trackConfig = trackConfigs[trackKey];
    if (productId && trackConfig[productId]) {
      // 产品埋点配置
      productTrack = trackConfig[productId];
    } else if (trackConfig['common']) {
      // 公共埋点配置
      productTrack = trackConfig['common']
    }
    // 单款产品，只打包单款产品的配置
    params['TRACK_CONFIG'] = JSON.stringify(productTrack);
    return new DefinePlugin(params);
  }
  /**
   * 获取的单个产品或者模块webpack配置
   * 如果有多个入口，则返回的是多个配置，不是单个配置，多个入口，而是一个入口，一个配置
   * @param entryConfig 入口配置
   * @param mode mode
   */
   getSingleConfig (entryConfig, mode) {
    let configs = [];
    const configName = this.configName;
    // 入口文件可以是多个
    entryConfig && entryConfig.forEach((entry, eIndex) => {
      let outPath = entry.name;
      // 获取基本配置，且修改config不会改变this.baseConfig的值
      let config = this.baseConfig;
      if (this.site === 'anyi') {
        // 用于兼容现在风险管家的Jenkins配置
        config.output.path = path.resolve(__dirname, './anyidist')
      }
      config.mode = mode || config.mode;
      config.entry = {};
      config.entry[entry.name] = entry.path;

      let plugins = [];
      // 编译时可以配置的全局常量
      const definePlugin = this.getDefinePluginConfig({ configName, productId: entry.productId });
      console.log('----definePlugin---', definePlugin)
      // 添加全局变量配置
      plugins.push(definePlugin);

      if (entry.library) {
        // 模块打包配置
        config = this.setModuleConfig({ config, outPath, entry, mode })
      } else {
        // 产品打包配置
        config = this.setProductConfig({ config, outPath, entry, mode })
      }
      config.plugins = config.plugins.concat(plugins);
      config.module.rules = this.getRules({
        src: outPath,
        mode
      });
      configs.push(config);
    });
    if (configs.length > 0 && !configs[0].output.library) {
      // 多个产品时，其实只需要复制一次就可以了
      configs[0].plugins.push(new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, './static'),
          to: 'static',
          ignore: ['.*']
        }
      ]))
    }

    return configs;
  }
  /**
   * 在通用配置基础上，单独设置产品的Webpack配置
   * @param config
   * @param outPath
   * @param entry
   * @param mode
   * @returns {*}
   */
   setProductConfig ({ config, outPath, entry, mode }) {
    config.output.filename = `${outPath}/js/[name].[chunkhash:8].js`;
    config.output.chunkFilename = `${outPath}/js/[id].[chunkhash:8].js`;

    // let faviconPath=path.resolve(__dirname, `src/${outPath}/images/favicon.ico`);
    // if(!fs.existsSync(faviconPath)){
    //   faviconPath=path.resolve('./static/favicon.ico');
    // }
    let plugins = [
      // 拷贝产品doc文件夹的内容
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, `src/${outPath}/doc`),
          to: `${outPath}/doc`,
          ignore: ['.*']
        }
      ]),
      new HtmlWebpackPlugin({
        filename: entry.filename,
        template: entry.template,
        // favicon: faviconPath, //此方式favicon.ico会生成到根目录下，各项目的ico会互相覆盖
        // favicon:path.resolve('./static/favicon.ico'), //此方式各项目的favicon.ico是同一个
        favicon: false,
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: false
        }
      })
    ];

    if (mode !== 'development') {
      let minCssParams = {
        filename: `${outPath}/css/[name].[chunkhash:8].css`,
        chunkFilename: `${outPath}/css/[id].[chunkhash:8].css`
      };
      plugins.push(
        new MiniCssExtractPlugin(minCssParams)
      );
    } else {
      config.output.filename = 'js/[name].js';
      config.devtool = 'source-map';
      // 开发环境 不支持 chunkhash、contenthash
      delete config.output.chunkFilename;
      delete config.optimization;
    }
    config.plugins = config.plugins.concat(plugins);
    return config;
  }
  /**
   * 在通用配置基础上，单独设置模块的Webpack配置
   * @param config
   * @param outPath
   * @param entry
   * @param mode
   * @returns {*}
   */
   setModuleConfig ({ config, outPath, entry, mode }) {
    config.output.filename = '[name].js';
    config.output.library = entry.library;
    config.output.libraryTarget = 'umd';
    config.output.libraryExport = 'default';
    // 模块打包只打包成一个js，不需要chunkFilename和optimization
    delete config.output.chunkFilename;
    delete config.optimization;
    // 模块打包仅需一个css文件
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: `[name].css`
      })
    );
    return config;
  }

  /**
   * 获取Webpack Compiler
   * @returns {Compiler|MultiCompiler}
   */
  getWebpackCompiler () {
    let configs = [];
    this.products.forEach(p => {
      // 单个产品配置，可以同时运行多个产品，多个入口文件
      let singleConfig = this.getSingleConfig(p.entry, this.mode);
      configs = configs.concat(singleConfig);
    });
    // webpack compiler 实例
    return webpack(configs);
  }
}
/**
 * 产品配置类，根据入口文件自动生成
 */
class ProductConfig {
  /**
   * 获取模块相关配置文件
   * 当前仅支持m文件夹中的入口文件
   * @param folder 代码所在文件夹
   * @param entryJs 入口js
   * @returns {Array}
   */
  getModules (folder,entryJs){
    entryJs = entryJs || 'index';
    folder = folder || 'module';
    let src = `./src/${folder}/*/${entryJs}.js`;
    let result = [];
    // 获取产品配置
    glob.sync(src).forEach(function (path) {
      let reg = new RegExp(`^\\.\\/src\\/(${folder}\\/)(.*?)(\\/.*)`);
      let match = path.match(reg);
      if (match.length === 4) {
        let productId = match[2];
        let item = result.find((p) => {
          return p.id === productId;
        });
        // 发布的文件夹
        const publicPath = match[1] + productId;
        const entryName = publicPath;
        const paths = path.split('/');
        const index = paths.length - 1;
        /**
         * id 产品ID
         * name 构建时显示文本
         * publicPath: 发布路径,
         * entry.name 入口文件名称
         * entry.path 入口文件所在路径
         * entry.filename 构建后的文件名
         * entry.template 构建所有模板
         */
        if (!item) {
          result.push({
            id: productId,
            name: productId,
            publicPath: publicPath,
            entry: [{
              'productId': productId,
              'name': entryName,
              // 会全局污染，已配置 babel-preset-env，但之前代码必须修改才行， 经测试仅相差25kb
              'path': [path],
              'filename': paths.slice(2, index).join('/') + '.js',
              'library': 'anyi' + productId
            }]
          });
        } else {
          item.entry.push({
            'productId': productId,
            'name': entryName,
            'path': [path],
            'filename': paths.slice(2, index).join('/') + '.js',
            'library': 'anyi' + productId
          });
        }
      }
    });
    return result;
  }
  /**
   * 根据入口文件获取产品相关配置
   * 产品文件夹中仅识别带main.js的入口文件
   * 当前仅支持m文件夹中的入口文件
   * @param folder 代码所在文件夹
   * @param entryJs 入口js
   * @returns {Array}
   */
  getProducts(folder,entryJs){
    if (folder === 'module') return this.getModules(folder, entryJs);
    entryJs = entryJs || 'yunbao';
    entryJs = entryJs === 'yunbao' ? 'yunbao' : entryJs;
    folder = folder || 'm';
    let src = `./src/${folder}/*/${entryJs}.js`;
    let result = [];
    // 获取产品配置
    glob.sync(src).forEach(function (path) {
      let reg = new RegExp(`^\\.\\/src\\/(${folder}\\/)(.*?)(\\/.*)`);
      let match = path.match(reg);
      if (match.length === 4) {
        let productId = match[2];
        let item = result.find((p) => {
          return p.id === productId;
        });
        // 发布的文件夹
        const publicPath = match[1] + productId;
        const entryName = publicPath;
        const paths = path.split('/');
        const index = paths.length - 1;
        /**
         * id 产品ID
         * name 构建时显示文本
         * publicPath: 发布路径,
         * entry.name 入口文件名称
         * entry.path 入口文件所在路径
         * entry.filename 构建后的文件名
         * entry.template 构建所有模板
         */
        if (!item) {
          result.push({
            id: productId,
            name: productId,
            publicPath: publicPath,
            entry: [{
              'productId': productId,
              'name': entryName,
              // 会全局污染，已配置 babel-preset-env，但之前代码必须修改才行， 经测试仅相差25kb
              'path': [path],
              // 'path': [path],
              'filename': paths.slice(2, index).concat('index.html').join('/'),
              'template': paths.slice(0, index).concat('index.html').join('/')
            }]
          });
        } else {
          item.entry.push({
            'productId': productId,
            'name': entryName,
            'path': [path],
            'filename': paths.slice(2, index).concat('index.html').join('/'),
            'template': paths.slice(0, index).concat('index.html').join('/')
          });
        }
      }
    });
    // 添加排序，后面开发的产品 自动排前面
    result.sort(function (param1, param2) {
      // 处理之前自动生成的id，让它不影响排序规则
      if (/^41/.test(param2.id) || /^41/.test(param1.id)) {
        return 1;
      }
      let id1 = param1.id.replace(/[a-z]/gi, '');
      let id2 = param2.id.replace(/[a-z]/gi, '');
      return id2.localeCompare(id1);
    });
    return result;
  }
}
module.exports = {
  ProductWebpack,
  ProductConfig,
  ProductServer
};
