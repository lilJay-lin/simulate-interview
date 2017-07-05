/**
 * Created by linxiaojie on 2017/6/30.
 */
const _ = require('lodash')
const STATUS = require('./status')
const DATA_VALIDATION_ERROR_NAME = 'ValidationError'
const NORMAL_ERROR_NAME = 'NormalError'
const UN_AUTHORIZATION = 401
const REQUEST_NOT_FOUND = 404
const REQUEST_METHOD_NOT_FOUND = 405
const SERVER_ERROR = 500
const REQUEST_SUCCESS = 200
const ERROR_MESSAGE = '请求异常，请检查'
const DATA_ERROR_MESSAGE = '数据校验不通过，请检查'
const UN_AUTHORIZATION_MESSAGE = '请求未认证'

module.exports.catch = () => {
  return async (cxt, next) => {
    try {
      await next()
      if (cxt.status === REQUEST_NOT_FOUND) {
        cxt.body = {
          status: STATUS.ERROR_STATUS,
          message: 'request no found'
        }
      } else if (cxt.status === REQUEST_METHOD_NOT_FOUND) {
        cxt.body = {
          status: STATUS.ERROR_STATUS,
          message: 'request method no found'
        }
      }
      else if (cxt.response.is('json')) {
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
      * 请求未认证
      * */
      if (cxt.status === UN_AUTHORIZATION) {
        body.message = UN_AUTHORIZATION_MESSAGE
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
      /*
      * 正常业务逻辑抛出来的提示错误
      * */
      else if (err.name === NORMAL_ERROR_NAME) {
        body.message = err.message
      }
      cxt.body = body
    }
  }
}

module.exports.getNormalError = (message) => {
  const error = new Error(message)
  error.status = REQUEST_SUCCESS
  error.name = NORMAL_ERROR_NAME
  return error
}