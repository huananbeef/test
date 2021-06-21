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

// 平台
const sites = {
  
}