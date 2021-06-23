/**
 * 原生ajax
 */
function $ajax(){
  var ajaxData = {
    type:arguments[0].type || "GET",
    url:arguments[0].url || "",
    async:arguments[0].async || "true",
    data:arguments[0].data || null,
    dataType:arguments[0].dataType || "text",
    contentType:arguments[0].contentType || "application/x-www-form-urlencoded",
    beforeSend:arguments[0].beforeSend || function(){},
    success:arguments[0].success || function(){},
    error:arguments[0].error || function(){}
  }
  ajaxData.beforeSend()
  var xhr = createxmlHttpRequest();
  xhr.responseType=ajaxData.dataType;
  xhr.open(ajaxData.type,ajaxData.url,ajaxData.async);
  xhr.setRequestHeader("Content-Type",ajaxData.contentType);
  xhr.send(convertData(ajaxData.data));
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if(xhr.status == 200){
        ajaxData.success(xhr.response)
      }else{
        ajaxData.error()
      }
    }
  }
}

function createxmlHttpRequest() {
  if (window.ActiveXObject) {
    return new ActiveXObject("Microsoft.XMLHTTP");
  } else if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  }
}

function convertData(data){
  if( typeof data === 'object' ){
    var convertResult = "" ;
    for(var c in data){
      convertResult+= c + "=" + data[c] + "&";
    }
    convertResult=convertResult.substring(0,convertResult.length-1)
    return convertResult;
  }else{
    return data;
  }
}


/**
 * 微信分享
 * @param config 微信分享配置，用默认不传 或用 {}
 * @param onready 分享初始化成功回调函数
 * @param getWxConfigFn 获取微信配置函数，接收回调函数
 */
var weixin = weixin || {};


weixin.share = function (config, onready, getWxConfigFn) {
  function ready(wxConfig){
    if (window.wx) {
      window.wx.config(wxConfig);
      window.wx.ready(function () {
        if (onready) {
          onready(window.wx, config || {});
        } else {
          weixin.update(config || {});
        }
      });
    }
  }
  if(!getWxConfigFn){
    getWxConfigFn = function (cb){
      var link = encodeURIComponent(location.href.split('#')[0]);
      var url = '/wechat/getjsconfig?url=' + link;
      $ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success:cb
      })
    }
  }
  getWxConfigFn(ready)
};
/**
 * 微信公众号分享设置
 * @param config
 */
weixin.update = function (config) {
  if(!config) return;
  config = config || {};
  if (window.wx) {
    window.wx.onMenuShareTimeline(config);
    window.wx.onMenuShareAppMessage(config);
  }
};
