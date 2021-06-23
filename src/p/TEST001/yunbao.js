/**
 * 入口文件
 * 默认使用动态路由，动态路由搞不定时，可以使用router中的静态路由
 * 如果目录下的大量vue文件不使用，可以改为静态路由
 * 
*/
import Vue from 'vue';
import Router from 'vue-router';
import ElementUI from 'element-ui';
import App from './App.vue';
import store from './store';
// import 'element-ui/lib/theme-chalk/index.css';
// import trackPlugins from '@/common/plugin.track.js'
// import trackConfig from './config/track';
// import TJDirective from './config/TJ';
// import '@/css/common-theme-deepblue.scss'
import Layout from './components/layout.vue'
import Http from '@/common/httpServer'
import './config/utils';

Vue.use(Router);
Vue.use(ElementUI);
// Vue.use(TJDirective);
Vue.prototype.$http = new Http();
Vue.config.productionTip = false;

Vue.prototype.$submitDisabled = false;

// 获取views文件夹下所有的Vue文件
const views = require.context('./views/', true, /.*\.vue$/).keys();
// 大部分场景下，使用动态路由即可
const routePage = views.map(v => {
  const name = v.match(/\.\/(.*)\.vue/)[1];
  const comp = () => Promise.resolve(require(`./views/${name}.vue`));
  return {
    path: name,
    component: comp
  }
});

export const routeMap = [
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: routePage
  }
]

// 动态路由
const router = new Router({
  mode: 'hash', // 后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: routeMap
  // base: '/p/HMBHZ20201027002-001/'
});

// Vue.use(trackPlugins, {
//   router,
//   store,
//   config: trackConfig
// })
new Vue({
  router,
  store,
  render: create => create(App)
}).$mount('#product');

// 非生产环境
// if (!/\.com$/.test(location.origin)) {
//   const img = document.createElement('img')
//   img.src = '/static/develop.png';
//   img.style.width = '200px'
//   img.style.position = 'fixed'
//   img.style.right = '134px'
//   img.style.bottom = '223px'
//   img.style.zIndex = '999'
//   document.body.append(img)
// }

// if (Vue.prototype.$submitDisabled) {
//   const img = document.createElement('img')
//   img.src = '/static/disabled.png';
//   img.style.width = '200px'
//   img.style.position = 'fixed'
//   img.style.right = '134px'
//   img.style.bottom = '323px'
//   img.style.zIndex = '999'
//   document.body.append(img)
// }
