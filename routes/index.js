/**
 * Created by linxiaojie on 2017/6/13.
 */
const glob = require('glob')
const path = require('path')
const files = glob.sync(path.resolve(__dirname, './*.js'))
const _ = require('lodash')
const Router = require('koa-router')
const router = new Router({
  prefix: '/api'
})
_.each(files, (file) => {
  if (file.indexOf('/index.js') === -1) {
    const name = file
      .replace(/[^\/]*\//g, '')
      .replace(/\.js$/g, '')
      .replace(/\//g, '.')
      .toLowerCase()
    router.use('/' + name, require(file).routes())
  }
})

module.exports = router
