/**
 * 
*/
// 数据请求地址 通过全局变量
import axios from 'axios';
import { Loading } from 'element-ui';

export default class HttpServer {
  /**
   * 获取公共的post请求
   * @param {method} 请求方式
   * @param {url} 请求地址
   * @param {data} 请求数据
   * @param {loading} 是否执行加载图标
   * @returns {Promise} 异步对象
  */
 /**
  * 获取公共post请求
  * @param params
  * @return {Promise<any>}
 */
post (params){
  const config = {
    method: params.method || 'post', //
    url: params.url,
    data: params.data
  };
  if(params.headers && typeof params.headers === 'object'){
    config.headers = config.headers || {};
    for(const key in params.headers){
      config.headers[key] = params.headers[key]
    }
  }
  config.onUploadProgress = params.onUploadProgress
  if(params.loading){
    var loadingInstance = Loading.service({
      text: typeof params.loading === 'string' ? params.loading : ''
    })
    if(params.timeout){
      config.timeout = params.timeout;
    }
    return axios(config).then((res)=>{
      loadingInstance && loadingInstance.close();
      return res.data;
    }).catch((error)=>{
      loadingInstance && loadingInstance.close();
      const res = error.response;
      // const req = error.request;
      //
      const msg = HttpServer.httpMsg(res);
      //
      return Promise.reject(msg);
    })
  }
}
/**
 * 获取公共get 请求
 * @param params params.data 数据
 * @returns {Promise<any>}
*/
get(params){
  // 开启数据加载图标
  // 处理传参
  params.params = params.data || {};
  const config = {
    method: 'get',
    url: params.url,
    params: params.data || params.params
  }
  if(params.headers && typeof params.headers === 'object'){
    config.headers = config.headers || {};
    for(const key in params.headers){
      config.headers[key] = params.headers[key]
    }
  }
  return axios(config).then(function(res){
    return res.data;
  }).catch(function(error){
    const res = error.response;
    const msg = HttpServer.httpMsg(res);
    return Promise.reject(msg);
  })
}
/**
 * http 错误信息
 * @param res
 * @returns {string}
*/
  static httpMsg(res){
    if(!res){
      return '当前网络不可用，请检查网络设置'
    }
    let msg = '出错了'
    const msgConfig = {
      0: '当前网络不可用，请检查网络设置',
      400: '系统繁忙，请稍后再试',
      401: '登陆已过期，请重新登陆',
      403: '抱歉，您没有操作权限',
      404: '系统升级中，请稍后访问（404）',
      500: '系统升级中，暂时无法操作，请稍后再试（500）',
      503: '系统升级中，暂时无法操作，请稍后再试（503）'
    }
    const status = res.status;
    const json = res.data;
    // 兼容后端各种数据结构
    const backMsg = json.msg || json.errMsg || json.errmsg || json.message || json.result;
    // 503优先显示后端错误
    if(status === 503 && backMsg){
      msg = backMsg
    } else {
      msg = msgConfig['' + status] || backMsg || '出错了'
    }
    return msg;
  }
  /**
   * 获取URL中参数
   * 修改，用于兼容#/policy/policyInfo?id=4F11111这种类型的参数
   * @param name 参数名
   * @returns {*}
  */
 getUrlParam(name){
   const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
   let r = window.location.search.substr(1).match(reg);
   if(r!==null) return decodeURIComponent(r[2]);
   if(window.location.hash.indexOf('?')>-1){
     r = window.location.hash.split('?')[1].match(reg);
   }
   if(r!==null) return decodeURIComponent(r[2]);
   return null
 }
 /**
  * 获取cookie
  * @param name
  * @param value
  * @param daus
  * @returns {*}
 */
 getCookie(name,value,days){
   if(arguments.length === 1){
     const nameEQ = name + '=';
     const ca = document.cookie.split(';');
     for(let i = 0;i < ca.length;i++){
       let c = ca[i];
       while(c.charAt(0) === ' ') c = c.substring(1, c.length);
       if(c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
     }
     return null
   } else if(arguments.length > 1){
     this.setCookie(name, encodeURIComponent(value), days)
   }
 }
 /**
  * 设置cookie
  * @param {string} name 键名
  * @param {string} value 键值
  * @param {number} days cookie周期
 */
setCookie(name,value,days){
  let expires = '';
  if(days){
    const date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    expires = ';expires=' + date.toGMTString();
  }
  document.cookie = name + '=' + value + expires + ';path=/'
}
/**
 * 移除cookie
 * @param name
*/
removeCookie(name){
  this.setCookie(name, '', -1)
}
}