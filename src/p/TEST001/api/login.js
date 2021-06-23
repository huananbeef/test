import Http from '../../../common/httpServer'
import { getToken } from '../api/auth'
const http = new Http();

export default {
  login (account, password) {
    return http.post({
      url: '/ws_enterprise_center/user/login',
      method: 'post',
      data: { 'account': account, 'password': password }
    })
  },
  register (email, code, password) {
    return http.post({
      url: '/ws_enterprise_center/user/regist',
      method: 'post',
      data: { 'email': email, 'code': code, 'password': password }
    })
  },
  getInfo (token) {
    return http.post({
      url: '/ws_enterprise_center/user/getUserInfo',
      method: 'post',
      headers: {
        'user-token': getToken()
      }
    })
  },
  logout (userToken) {
    return http.post({
      url: '/zhpt/user/user/loginOut.action',
      method: 'post',
      data: { 'userToken': userToken }
    })
  },
  emailCode (type, email) {
    return http.post({
      url: '/ws_enterprise_center/user/emailCode',
      method: 'post',
      data: { 'type': type, 'email': email }
    })
  },
  resetPassword (email) {
    return http.post({
      url: '/ws_enterprise_center/user/resetPassword',
      method: 'post',
      data: { 'email': email }
    })
  }
}
