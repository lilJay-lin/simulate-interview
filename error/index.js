/**
 * Created by linxiaojie on 2017/6/30.
 */
const _ = require('lodash')
const STATUS = require('./status')
const DATA_VALIDATION_ERROR_NAME = 'ValidationError'
const NOT_FOUND = 404
const SERVER_ERROR = 500
const ERROR_MESSAGE = '请求异常，请检查'
const DATA_ERROR_MESSAGE = '数据校验不通过，请检查'
module.exports = () => {
  return async (cxt, next) => {
    try {
      await next()
      if (cxt.status === NOT_FOUND) {
        cxt.body = {
          message: 'request no found'
        }
      } else if (cxt.response.is('json')) {
        cxt.body.status = STATUS.SUCCESS_STATUS
      }
    } catch (err) {
      cxt.status = err.statusCode || err.status || SERVER_ERROR
      cxt.log.error(err.message)
      let body = {
        status: STATUS.ERROR_STATUS,
        message: ERROR_MESSAGE
      }
      /*
      * 表单校验错误
      * */
      if (err.name === DATA_VALIDATION_ERROR_NAME) {
        body.status = STATUS.DATA_ERROR_STATUS
        let fields = {}
        _.forEach(err.errors, (e) => {
          fields[e.path] = e.message
        })
        body = {
          status: STATUS.DATA_ERROR_STATUS,
          message: DATA_ERROR_MESSAGE,
          fields
        }
      }
      cxt.body = body
    }
  }
}