
(function (para) {
  if (window.location.href.indexOf('https') < 0) {
    para.server_url = 'https://shence.wosai-inc.com:8106/sa?project=customeranatest';
  }
  try {
    var search = new URLSearchParams(location.search);
    var show_log = search.get('show_log');
    if (Number(show_log) === 0) {
      para.show_log = false;
    }
  } catch (e) {}
  var p = para.sdk_url;
  var n = para.name;
  var w = window;
  var d = document;
  var s = 'script';
  var x = null;
  var y = null;
  w['sensorsDataAnalytic201505'] = n;
  w[n] = w[n] || function (a) {
    return function () {
      (w[n]._q = w[n]._q || []).push([a, arguments]);
    }
  };
  var ifs = ['track', 'quick', 'register', 'registerPage', 'registerOnce', 'trackSignup', 'trackAbtest',
    'setProfile', 'setOnceProfile', 'appendProfile', 'incrementProfile', 'deleteProfile', 'unsetProfile',
    'identify', 'login', 'logout', 'trackLink', 'clearAllRegister', 'getAppStatus'];
  for (var i = 0; i < ifs.length; i++) {
    w[n][ifs[i]] = w[n].call(null, ifs[i]);
  }
  if (!w[n]._t) {
    x = d.createElement(s), y = d.getElementsByTagName(s)[0];
    x.async = 1;
    x.src = p;
    x.setAttribute('charset', 'UTF-8');
    y.parentNode.insertBefore(x, y);
    w[n].para = para;
  }
})({
  sdk_url: 'https://statics.wosaimg.com/cdn/sensor/1.12.8/sensorsdata.min.js',
  heatmap_url: 'https://statics.wosaimg.com/cdn/sensor/1.12.8/heatmap.min.js',
  name: 'sensors',
  server_url: 'https://shence.wosai-inc.com:8106/sa?project=customerana',
  heatmap: {
    clickmap: 'default'
  }
});

window.addEventListener('load', function () {
  var id = sessionStorage.getItem('OPERTOR_ID');
  if (id) {
    sensors.login(id);
    sensors.quick('autoTrack');
    console.log('login sensors by operator_id by weixin: ' + id);
  } else {
    if (window.AlipayJSBridge) {
      AlipayJSBridge.call('wUserGetUser', {}, function (result) {
        try {
          var u = navigator.userAgent;
          var isIos = u.indexOf('iPhone') >= 0;
          if (isIos) {
            var r = JSON.parse(result.data.result);
            id = r.id;
          } else {
            id = result.data.user.id;
          }
          console.log('login sensors by operator_id: ' + id);

          if (id) {
            sensors.login(id);
            sensors.quick('autoTrack');
            console.log('login sensors by operator_id: ' + id);
          }
        } catch (e) {
          // sensors.quick('autoTrack');
          console.log('can not get user info from bridge', e);
        }
      });
    } else {
      console.log('sensors Wait AlipayJSBridge ready.');
      // sensors.quick('autoTrack');
    }
  }
});
