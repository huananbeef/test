/**
 * 
*/
// node --inspect --inspect-brk dev
// 命令行开发
const program = require('commander');
// 用于命令交互
const inquirer = require('inquirer');
// open 就是opn，webpack-dev-server用的就是opn，但只有cli,模式支持
const open = require('open');
// 复制到剪切板
const clipboardy = require('clipboardy');

// 平台
const sites = {
  'test': 'test',
  'sale': '电销平台'
}

/**
 * ProductWebpack 产品Webpack配置
 * ProductConfig 产品入口配置
 * ProductServer 开发环境WebServer
 */
const {ProductWebpack, ProductConfig, ProductServer} = require('./product.config');
/**
 * 运行配置
 * @type {Object}
*/
const baseRunConfig = {
  'module': {
    name: '通用模块',
    entryJs: 'index',
    folder: 'module',
    id: 'mid'
  },
  'channel': {
    name: '渠道定制产品',
    entryJs: 'yunbao',
    folder: 'c',
    id: 'cid'
  },
  'list': {
    name: '产品列表页',
    entryJs: 'index',
    folder: 'list',
    id: 'lid'
  },
  'p':{
    name: '标准产品',
    entryJs: 'yunbao',
    folder: 'p',
    id: 'pid'
  }
}
/**
 * 获取运行配置
 * @param option 命令参数
 * @param runConfig 运行配置
 * @returns {*}
 */
 const getRunConfig = function (option, runConfig) {
  let { site } = option;
  let entryJs; // 入口js
  if (site) entryJs = site;
  if (site === 'yunbao') entryJs = 'yunbao';
  // 产品ID // 类型
  let { pid, type = 'p' } = option;
  // 活动id // 模块id // 渠道定制产品ID // 列表页ID
  // 等价于 const aid = option.aid
  const { aid, mid, cid, lid } = option;
  if (aid || type === 'activity') type = 'act';
  if (mid) type = 'module';
  if (cid) type = 'channel';
  if (lid) type = 'list';

  let config = runConfig[type];
  // 云保的默认入口为main.js，其他为站点名称
  config.entryJs = entryJs || config.entryJs;
  // 产品ID，参数传了就有
  // aid 活动id // mid 模块id // cid 渠道定制产品ID // lid 列表页ID
  config.pid = option[config.id] || pid;
  config.site = site;
  return config;
};

/**
 * 获取将要运行或构建的产品配置
 * @param runConfig
 * @returns {*}
 */
 const getRunProductConfig = function (runConfig) {
  // 产品配置
  const productConfig = new ProductConfig();
  // 产品ID // 代码所在文件夹 // 入口文件 // 运行类型名称
  const { pid, folder, entryJs, name, dev = false } = runConfig;
  // 根据入口文件获取产品相关配置
  const products = productConfig.getProducts(folder, entryJs);
  const action = dev ? '运行' : '构建';
  let runProducts = [];
  if (pid && pid !== 'all') {
    let ids = pid.split(',');
    runProducts = products.filter(p => {
      return ids.indexOf(p.id) > -1;
    });
    if (runProducts.length === 0) {
      console.log(`${name}ID[${pid}]不存在`)
    }
  } else if (pid === 'all' && !dev) {
    console.log('您选择构建所有产品');
    runProducts = products;
  }
  if (runProducts.length === 0) {
    const promps = [];
    // 获取可以选择的产品
    let choices = products.map(p => {
      return { name: p.name, value: p.id };
    });
    if (!dev) {
      choices.unshift({ name: '所有产品', value: 'all' });
    }
    promps.push({
      type: 'list',
      name: 'productId',
      message: `请选择想要${action}的${name}ID`,
      choices: choices
    });

    return inquirer.prompt(promps).then((answers) => {
      const productId = answers.productId;
      let runProducts = products.filter(p => {
        return p.id === productId || productId === 'all';
      });
      console.log(`您选择${action}${name}：${productId}`);
      return runProducts;
    })
  } else {
    return Promise.resolve(runProducts);
  }
};

/**
 * 构建测试环境
 * @param site 平台
 * @param products 产品或者活动列表
 */
 const buildTest = async function (products, site) {
  const productWebpack = new ProductWebpack({
    products,
    mode: 'production',
    configName: 'test',
    site
  });

  // 产品ID
  const productId = products.map(p => p.id).join(',');

  // webpack compiler 实例
  const compiler = productWebpack.getWebpackCompiler();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let name = sites[site] || '';
      if (err || stats.hasErrors()) {
        // 在这里处理错误
        let msg = '打包' + name + '测试环境产品：' + productId + '失败，错误原因' + stats.toString();
        resolve({ code: 0, productId: productId, msg: msg });
        console.log(msg)
      } else {
        // 处理完成
        let msg = '打包' + name + '测试环境产品：' + productId + '成功';
        resolve({ code: 1, productId: productId, msg: msg });
        console.log(msg);
      }
    })
  });
};

/**
 * 构建生产环境
 * @param site 平台
 * @param products 产品或者活动列表
 */
 const build = async function (products, site) {
  const productWebpack = new ProductWebpack({
    products,
    mode: 'production',
    configName: 'production',
    site
  });

  // 产品ID
  const productId = products.map(p => p.id).join(',');

  // webpack compiler 实例
  const compiler = productWebpack.getWebpackCompiler();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let name = sites[site] || '';
      if (err || stats.hasErrors()) {
        // 在这里处理错误
        let msg = '打包' + name + '生产环境产品：' + productId + '失败，错误原因' + stats.toString();
        resolve({ code: 0, productId: productId, msg: msg });
        console.log(msg)
      } else {
        // 处理完成
        let msg = '打包' + name + '生产环境产品：' + productId + '成功';
        resolve({ code: 1, productId: productId, msg: msg });
        console.log(msg);
      }
    })
  });
};

/**
 * 运行测试服务器
 * @param products 当前产品相关配置，为数组，支持多款产品
 */
 const runDev = async function (products) {
  const mode = 'development';
  const productWebpack = new ProductWebpack({
    products,
    mode
  });

  // 构建后打开路径
  let openPath = '';
  if (products.length > 0) {
    openPath = openPath + products[0].entry[0].filename;
  }

  // 产品ID
  const productId = products.map(p => p.id).join(',');

  // webpack compiler 实例
  const compiler = productWebpack.getWebpackCompiler();

  const productServer = new ProductServer({
    openPath,
    productId,
    compiler
  });

  return productServer.run();
};


/**
 * 公共构建方法 用于支持各种入口的参数
 * @param site 平台
 * @param products 所有产品信息
 * @param buildFunc 构建方法
 */
 const buildById = async function (products, site, buildFunc) {
  for (let p of products) {
    await buildFunc([p], site);
  }
};

program
  .command('dev')
  .alias('d')
  .description('运行本地测试环境')
  .option('-p, --pid [product ID]', '产品ID或者活动ID')
  .option('-s, --site [site name]', '站点名称yunbao、anyi、sale等')
  .option('-m, --mid [module ID]', '模块ID')
  .option('-t, --type [type]', '构建类型')
  .option('-a, --aid [activity ID]', '活动ID')
  .option('-c, --cid [channel product ID]', '渠道定制产品ID')
  .option('-l, --lid [list ID]', '列表页ID')
  .action(option => {
    // 获取运行配置
    const runConfig = getRunConfig(option, baseRunConfig);
    // 产品ID // 运行类型名称
    const { pid, name } = runConfig;
    console.log(`你选择运行${name}`);
    if (pid) console.log(`产品ID为：${pid}`);
    if (pid === 'all') {
      console.log(`本地测试环境当前不支持运行所有${name}，支持运行多款，用逗号隔开`);
      return;
    }
    runConfig.dev = true;
    getRunProductConfig(runConfig).then(runDev).then(devOptions => {
      if (devOptions && devOptions.open) {
        open(devOptions.openPage);
      } else {
        clipboardy.writeSync((devOptions && devOptions.openPage) || '');
        console.log(`访问地址已复制到剪切板，直接粘贴即可。`);
      }
    });
  });

  program
  .command('test')
  .alias('t')
  .description('构建测试环境产品')
  .option('-p, --pid [product ID]', '产品ID或者活动ID')
  .option('-s, --site [site name]', '站点名称yunbao、anyi')
  .option('-m, --mid [module ID]', '模块ID')
  .option('-t, --type [type]', '构建类型')
  .option('-a, --aid [activity ID]', '活动ID')
  .option('-c, --cid [channel product ID]', '渠道定制产品ID')
  .option('-l, --lid [list ID]', '列表页ID')
  .action(option => {
    // 获取运行配置
    const runConfig = getRunConfig(option, baseRunConfig);
    // 产品ID // 运行类型名称
    const { pid, name, site } = runConfig;
    console.log(`你选择运行${name}`);
    if (pid) console.log(`产品ID为：${pid}`);
    getRunProductConfig(runConfig).then(runProducts => {
      return buildById(runProducts, site, buildTest);
    });
  });

  program
  .command('build')
  .alias('t')
  .description('构建生产环境产品')
  .option('-p, --pid [product ID]', '产品ID或者活动ID')
  .option('-s, --site [site name]', '站点名称yunbao、anyi')
  .option('-m, --mid [module ID]', '模块ID')
  .option('-t, --type [type]', '构建类型')
  .option('-a, --aid [activity ID]', '活动ID')
  .option('-c, --cid [channel product ID]', '渠道定制产品ID')
  .option('-l, --lid [list ID]', '列表页ID')
  .action(option => {
    // 获取运行配置
    const runConfig = getRunConfig(option, baseRunConfig);
    // 产品ID // 运行类型名称
    const { pid, name, site } = runConfig;
    console.log(`你选择运行${name}`);
    if (pid) console.log(`产品ID为：${pid}`);
    getRunProductConfig(runConfig).then(runProducts => {
      return buildById(runProducts, site, build);
    });
  });

// 解析命令行
program.parse(process.argv);
