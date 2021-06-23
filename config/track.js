/**
 * 预设埋点文件
 * 埋点和打包杂揉在一起了，绝了……
 * @type Object
*/
module.exports = {
  // 
  development: {
    // 通用配置
    'common': {
      'name': '标准产品',
      'auto': 'p', // 自动取值规则
      'platform': { // 统计平台配置
        'umeng': '1276378084'
      }
    },
    // 康乐一生保费测算活动
    'AFOSUN20180522001-p': {
      'name': '保费测算落地页',
      'auto': 'p',
      'platform': {
        'umeng': '1277223757',
        'baidu': '85702796fa50aeafa60f92578de930e7'
      },
      // 渠道参数为source，默认为appid
      'param': 'source',
      // 渠道配置，支持给不同渠道设置不同的统计代码
      'channel': {
        'bfcs-shengbei-app': {
          'name': '省呗App',
          'umeng': '1277223757',
          'baidu': '85702796fa50aeafa60f92578de930e7'
        },
        'bfcs-baidu-app': {
          'name': '百度APP',
          'umeng': '1277223757',
          'baidu': '85702796fa50aeafa60f92578de930e7'
        },
        'bfcs-meiyou-app': {
          'name': '美柚APP',
          'umeng': '1277223757',
          'baidu': '85702796fa50aeafa60f92578de930e7'
        }
      }
    }
  },
  production: {
    // 通用配置
    'common': {
      'name': '标准产品',
      'auto': 'p',
      'platform': {
        'umeng': '1276716266'
      }
    },
    // 康乐一生保费测算活动
    'AFOSUN20180522001-p': {
      'name': '保费测算落地页',
      'auto': 'p',
      'platform': {
        'umeng': '1277223769',
        'baidu': '85702796fa50aeafa60f92578de930e7'
      },
      // 渠道参数为source，默认为appid
      'param': 'source',
      // 渠道配置，支持给不同渠道设置不同的统计代码
      'channel': {
        'bfcs-shengbei-app': {
          'name': '省呗App',
          'umeng': '1277223769',
          'baidu': '85702796fa50aeafa60f92578de930e7'
        },
        'bfcs-baidu-app': {
          'name': '百度APP',
          'umeng': '1277223769',
          'baidu': '85702796fa50aeafa60f92578de930e7'
        },
        'bfcs-meiyou-app': {
          'name': '美柚APP',
          'umeng': '1277223769',
          'baidu': '85702796fa50aeafa60f92578de930e7'
        }
      }
    }
  }
}