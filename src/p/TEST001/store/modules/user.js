
import { getToken, setToken, removeToken } from '../../api/auth'
import api from '../../api/login'

/**
 * 去掉空格
 * @param val
 * @returns {*}
 */
const trim = function (val) {
  return val.replace(/^\s+/, '').replace(/^\s+$/, '');
};

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    email: '',
    username: ''
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_EMAIL: (state, email) => {
      state.email = email
    },
    SET_USERNAME: (state, username) => {
      state.username = username
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      let account = trim(userInfo.account);
      return api.login(account, userInfo.password).then(res => {
        if (res.errcode === '0' && res.result) {
          setToken(res.result.token);
          commit('SET_TOKEN', res.result.token);
          return Promise.resolve(res);
        }
        return Promise.reject(res.errmsg);
      });
    },

    // 注册
    Register ({ commit }, userInfo) {
      let email = trim(userInfo.email);
      return api.register(email, userInfo.code, userInfo.password).then(res => {
        if (res.errcode === '0' && res.result) {
          setToken(res.result.token);
          commit('SET_TOKEN', res.result.token);
          return Promise.resolve(res);
        }
        return Promise.reject(res.errmsg);
      });
    },

    // 获取用户信息
    GetInfo ({ commit, state }) {
      return api.getInfo(state.token).then(res => {
        if (res.errcode === '0' && res.result) {
          const data = res.result;
          commit('SET_USERNAME', data.username);
          commit('SET_EMAIL', data.email);
          return res;
        }
        return Promise.reject(res.errmsg);
      });
    },

    // 登出
    LogOut ({ commit, state }) {
      return api.logout(state.token).then(() => {
        commit('SET_TOKEN', '');
        removeToken();
        return Promise.resolve()
      }).catch(() => {
        commit('SET_TOKEN', []);
        removeToken();
        return Promise.resolve()
      });
    },

    // 前端 登出
    FedLogOut ({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 检查是否登录
    CheckLogin ({ commit, state }) {
      let token = getToken();
      // eslint-disable-next-line prefer-promise-reject-errors
      if (!token) return Promise.reject({ code: 0, msg: '请重新登录' });
      return api.getInfo(token).then(res => {
        if (res.errcode === '0' && res.result) {
          const data = res.result;
          commit('SET_USERNAME', data.username);
          commit('SET_EMAIL', data.email);
          return res;
        }
        return Promise.reject(res.errmsg);
      });
    }
  }
}

export default user
