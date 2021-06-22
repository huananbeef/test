// 日期时间格式化 扩展到原型
// 时间格式化
Date.prototype.toFormat = function (fmt){
  if (!this || !fmt) {
    return '';
  }
  let date = null;
  if (Object.prototype.toString.call(this) === '[object Date]') {
    date = this;
  } else if (Object.prototype.toString.call(this) === '[object String]') {
    date = new Date(this);
    if (isNaN(date)) {
      let reg = /^(1[89]\d\d|2[01][01]\d)[-|\/](1[0-2]|0\d|\d)[-|\/](\d|[0-2]\d|3[01])$/;
      if (this.indexOf('T') > -1) {
        // 为了兼容曾经后端输错错误的UTC格式
        let parts = this.match(/\d+/g);
        let isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
        date = new Date(isoTime);
      } else if (reg.test(this)) {
        // 兼容iOS这是不按套路的系统
        date = new Date(this.replace(reg, '$2/$3/$1'))
      }
    }
  }
  // 其他规则暂时不支持
  if (date === null || isNaN(date) || date === 'Invalid Date') {
    return '';
  }
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)); }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))); }
  }
  return fmt;
}
Date.getDateByNextNumDay = function (nextDate,time){
  if(time){
    time = time.replace(/\-/g, '/'); // 兼容IOS处理
    // 
    var now = new Date(time);
    let next = parseInt(nextDate);
    now.setDate(now.getDate() + (next));
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toFormat('yyyy-MM-dd')
  }
  return ''
}
// 验证身份证包括年龄 性别 生日等
Date.geCardInfooByCardId = function(val){
  if(!val) return null;
  if(val.length !== 18) return null;
  var reg = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/;
  if(!reg.test(val)) return null;
  var last = val.substring(val.length - 1);
  var lastNum = checkIdLast(val);
  if(last.toUpperCase() !== lastNum) return null;
  var result = {};
  var array = /^(\d{6})(\d{8})(\d{2})(\d{1})(\d{1}|x|X)$/.exec(val);
  result.birth = array[2].replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');// 设置出生日期
  result.sex = array[4] % 2 == 0 ? '1' : '0';// 设置性别
  var bArr = array[2].match(/^(\d{4})(\d{2})(\d{2})$/);
  var date = new Date(bArr[1], bArr[2] -1, bArr[3]);
  var now = new Date();
  var year = now.getFullYear() - date.getFullYear();
  if(date.getMonth()>now.getMonth()){
    year--;
  } else if(date.getMonth() === now.getMonth() && (date.getDate() > now.getDate())) {
    year--;
  }
  result.age = year; // 设置年龄
  return result;
}
// 通过年龄获取时间
Date.getDateByAge = function(age, format = 'yyyy-MM-dd'){
  if(age && typeof age === 'number'){
    var nowDate = new Date();
    nowDate.setYear(nowDate.getFullYear() - age)
    return nowDate.toFormat(format)
  }
  return new Date().toFormat(format)
}
// 通过时间或年龄 静态方法 date,生日 effect,生效日期
Date.getAgeByDate = function(date,effect){
  if(date && typeof date === 'string'){
    date = date.replace(/\-/g, '/'); // 兼容IOS处理
    var now;
    if(effect && typeof effect === 'string'){
      effect = effect.replace(/\-/g, '/'); // 兼容IOS处理
      now = new Date(effect)
    } else {
      now = new Date();
    }
    var nowY = now.getFullYear();
    date = new Date(date);
    var ageY = date.getFullYear()

    var year = nowY - ageY;
    if (date.getMonth() > now.getMonth()) {
      year--;
    } else if (date.getMonth() == now.getMonth() && date.getDate() > now.getDate()) {
      year--;
    }

    now = now.toFormat('yyyy-MM-dd') + ' 00:00:00';
    now = new Date(now);
    date = date.toFormat('yyyy-MM-dd') + ' 00:00:00';
    date = new Date(date);

    date = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24); // 计算出天数
    return { age: year, date: date };
  }
  return { age: 0, date: 0 };
}
Date.getDateSection = function (startAge, endAge, effect) {
  var timeObj = {
    startDate: '1900-01-01',
    endDate: '2020-01-01'
  };
  if (startAge == undefined || endAge == undefined) {
    return timeObj;
  } else {
    var startDate = null;
    if (effect == undefined) {
      startDate = new Date();
    } else {
      startDate = new Date(effect);
    }
    startDate.setYear(startDate.getFullYear() - endAge - 1)
    startDate.setDate(startDate.getDate() + 1);
    startDate = startDate.toFormat('yyyy-MM-dd');
    timeObj.startDate = startDate;
    var endDate = null;
    if (effect == undefined) {
      endDate = new Date();
    } else {
      endDate = new Date(effect);
    }
    endDate.setYear(endDate.getFullYear() - startAge)
    endDate = endDate.toFormat('yyyy-MM-dd');
    timeObj.endDate = endDate;
    return timeObj;
  }
}
// 通过年年龄区间获取时间区间
Date.getDateSectionByAge = function (startAge = 0, endAge = 65, format = 'yyyy-MM-dd') {
  var timeObj = {
    startDate: '1900-01-01',
    endDate: '2030-01-01'
  };
  if (startAge === undefined || endAge === undefined) {
    return timeObj;
  } else {
    var startDate = new Date();
    startDate.setYear(startDate.getFullYear() - endAge - 1)
    startDate.setDate(startDate.getDate() + 1);
    startDate = startDate.toFormat(format);
    timeObj.startDate = startDate;

    var endDate = new Date();
    endDate.setYear(endDate.getFullYear() - startAge)
    endDate = endDate.toFormat(format);
    timeObj.endDate = endDate;
    return timeObj;
  }
}
// 获取今天之后的时间 默认获取今天
Date.getNextDay = function (nextDate = 0, format = 'yyyy-MM-dd') {
  var now = new Date();
  now.setDate(now.getDate() + (nextDate || 0));
  now.setHours(0);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now.toFormat(format)
}
const checkIdLast = function (Num) {
  if (Num.length != 18) { return false; }
  var x = 0;
  var y = '';
  for (let i = 18; i >= 2; i--) { x = x + (square(2, (i - 1)) % 11) * parseInt(Num.charAt(19 - i - 1)); }
  x %= 11;
  y = 12 - x;
  if (x == 0) { y = '1'; }
  if (x == 1) { y = '0'; }
  if (x == 2) { y = 'X'; }
  return y;
};
// 求得x的y次方
const square = function (x, y) {
  var i = 1;
  for (let j = 1; j <= y; j++) { i *= x; }
  return i;
}

// 验证身份证包括年龄 性别 生日 等
Date.getCardInfo = function (val, effect) {
  if (!val) return null;
  if (val.length != 18) return null;
  var reg = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/;
  if (!reg.test(val)) return null;
  var last = val.substring(val.length - 1);
  var lastNum = checkIdLast(val);
  if (last.toUpperCase() != lastNum) return null;
  var result = {};
  var array = /^(\d{6})(\d{8})(\d{2})(\d{1})(\d{1}|x|X)$/.exec(val);
  result.birth = array[2].replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');// 设置出生日期
  result.sex = array[4] % 2 == 0 ? '1' : '0';// 设置性别
  var bArr = array[2].match(/^(\d{4})(\d{2})(\d{2})$/);
  var date = new Date(bArr[1], bArr[2] - 1, bArr[3]);
  var now = new Date();
  if (effect && typeof effect === 'string') {
    effect = effect.replace(/\-/g, '/');// 兼容ios处理
    now = new Date(effect);
  } else {
    now = new Date();
  }
  var year = now.getFullYear() - date.getFullYear();
  if (date.getMonth() > now.getMonth()) {
    year--;
  } else if (date.getMonth() == now.getMonth() && date.getDate() > now.getDate()) {
    year--;
  }
  result.age = year;// 设置年龄
  return result;
};

/*
  * 判断obj是否为一个整数
  */
function isInteger (obj) {
  return Math.floor(obj) === obj;
}

/*
* 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
* @param floatNum {number} 小数
* @return {object}
*   {times:100, num: 314}
*/
function toInteger (floatNum) {
  var ret = { times: 1, num: 0 };
  var isNegative = floatNum < 0;
  if (isInteger(floatNum)) {
    ret.num = floatNum;
    return ret;
  }
  var strfi = floatNum + '';
  var dotPos = strfi.indexOf('.');
  var len = strfi.substr(dotPos + 1).length;
  var times = Math.pow(10, len);
  var intNum = parseInt(Math.abs(floatNum) * times + 0.5, 10);
  ret.times = times;
  if (isNegative) {
    intNum = -intNum;
  }
  ret.num = intNum;
  return ret;
}
/*
* 核心方法，实现加减乘除运算，确保不丢失精度
* 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
*
* @param a {number} 运算数1
* @param b {number} 运算数2
* @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
* @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
*
*/
function operation (a, b, digits, op) {
  var o1 = toInteger(a);
  var o2 = toInteger(b);
  var n1 = o1.num;
  var n2 = o2.num;
  var t1 = o1.times;
  var t2 = o2.times;
  var max = t1 > t2 ? t1 : t2;
  var result = null;
  switch (op) {
    case 'add':
      if (t1 === t2) {
        // 两个小数位数相同
        result = n1 + n2;
      } else if (t1 > t2) {
        // o1 小数位 大于 o2
        result = n1 + n2 * (t1 / t2);
      } else {
        // o1 小数位 小于 o2
        result = n1 * (t2 / t1) + n2;
      }
      return result / max;
    case 'subtract':
      if (t1 === t2) {
        result = n1 - n2;
      } else if (t1 > t2) {
        result = n1 - n2 * (t1 / t2);
      } else {
        result = n1 * (t2 / t1) - n2;
      }
      return result / max;
    case 'multiply':
      result = n1 * n2 / (t1 * t2);
      return result;
    case 'divide':
      result = n1 / n2 * (t2 / t1);
      return result;
  }
}

// 加减乘除的四个接口
function add (a, b, digits) {
  return operation(a, b, digits, 'add');
}
function subtract (a, b, digits) {
  return operation(a, b, digits, 'subtract');
}
function multiply (a, b, digits) {
  return operation(a, b, digits, 'multiply');
}
function divide (a, b, digits) {
  return operation(a, b, digits, 'divide');
}

Number.add = add;// +
Number.subtract = subtract;// -
Number.multiply = multiply;//*
Number.divide = divide;// ÷

Math.randomString = function (len) {
  let $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdedfhijklmnopqrstuvwxyz23456789'; // 随机字符串
  let maxPos = $chars.length;
  let str = '';
  for (let i = 0; i < len; i++) {
    str += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return str;
};
/**
 * @minNum 最小区间
 * @maxNum 最大区间
 * @return {number} 返回一个区间内的随机整数
 */
Math.getRandom = function (minNum = 1, maxNum = 6) {
  return minNum + Math.floor(Math.random() * (maxNum - minNum + 1));
}

// 合并两个数组
Array.mergeArray = function (arr1 = [], arr2 = [], coreFn) {
  let result = [];
  if (arr1.length <= 0 && arr2.length > 0) return arr2;
  if (arr2.length <= 0 && arr1.length > 0) return arr1;
  let originArr = [...arr1, ...arr2]; // 合并数组

  // 数组去重
  for (let i = 0; i < originArr.length; i++) {
    let item = originArr[i];
    let flag = false;
    for (let j = 0; j < result.length; j++) {
      let tempItem = result[j]
      if (coreFn && coreFn(item, tempItem)) {
        flag = true; // 存在
        break;
      }
    }
    if (!flag) { // 结果集不存在
      result.push(item);
    }
  }
  return result
}

Array.isInArray = function (arr, callback) {
  if (arr && typeof arr === 'object' && arr instanceof Array && callback) {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (callback(item)) {
        return true;
      }
    }
  }
  return false;
}