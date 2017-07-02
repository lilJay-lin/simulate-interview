/**
 * Created by linxiaojie on 2016/9/2.
 */
const mongoose = require('mongoose')
const _ = require('lodash')

module.exports = {
  _validateMethod (schema) {
    return (paramObj) => {
      let {path, cb, message} = paramObj
      schema.path(path).validate({
        isAsync: true,
        validator: cb(paramObj),
        message
      })
    }
  },
  setValidateStrange (schema, cfg) {
    let me = this
    let exec = me._validateMethod(schema)
    let requiredProps = []
    _.forEach(cfg, (validator, key) => {
      let validators = _.isArray(validator) ? validator : [validator]
      _.forEach(validators, (param) => {
        let {method} = param
        if (method === 'required') {
          requiredProps.push(key)
        }
        delete param.method
        param.path = key
        param.cb = _.isFunction(method) ? method : me[method]
        if (!_.isFunction(param.cb)) {
          throw new Error('校验方法不存在:' + method)
        }
        exec(param)
      })
    })
    me.preValidate(schema, requiredProps)
  },
  /*
   * path阶段校验，不会校验保存对象中不存在的属性,增加pre('save')做校验
   * */
  preValidate (schema, props) {
    schema.pre('validate', function (next) {
      let entity = this
      _.forEach(props, (prop) => {
        if (entity[prop] === undefined) {
          entity[prop] = null
        }
      })
      next()
    })
  },
  /*
   * 不为空
   * */
  required () {
    return (value, done) => {
      return done(!_.isEmpty(value))
    }
  },
  /*
   * 值唯一
   * 更新时对当前数据触发了唯一值校验 issue #1
   * */
  unique ({path, _id, caseInsensitive}) {
    return function (value, done) {
      let doc = this;
      let isSubdocument = typeof doc.ownerDocument === 'function'
      let isQuery = doc.constructor.name === 'Query'
      let parentDoc = isSubdocument ? doc.ownerDocument() : doc
      let isNew = typeof parentDoc.isNew === 'boolean' ? parentDoc.isNew : !isQuery
      let pathValue = null
      let conditions = []
      if (isQuery) {
        pathValue = _.get(doc, '_update.$set.' + path);
      } else {
        pathValue = _.get(doc, isSubdocument ? path.split('.').pop() : path);
      }
      if (caseInsensitive) {
        pathValue = new RegExp('^' + pathValue + '$', 'i');
      }
      conditions.push({
        [path]: pathValue
      })
      if (!isNew) {
        // Use conditions the user has with find*AndUpdate
        if (isQuery) {
          _.each(doc._conditions, function(value, key) {
            var cond = {};
            cond[key] = { $ne: value };
            conditions.push(cond);
          });
        } else if (doc._id) {
          conditions.push({ _id: { $ne: doc._id } });
        }
      }
      // Obtain the model depending on context
      // https://github.com/Automattic/mongoose/issues/3430
      // https://github.com/Automattic/mongoose/issues/3589
      var model;
      if (doc.constructor.name === 'Query') {
        model = doc.model;
      } else if (isSubdocument) {
        model = doc.ownerDocument().model(doc.ownerDocument().constructor.modelName);
      } else if (typeof doc.model === 'function') {
        model = doc.model(doc.constructor.modelName);
      }
      model.where({ $and: conditions }).count(function(err, count) {
        done(count === 0);
      });
    }
  },
  /*
   * 长度校验
   * 默认值0，表示不需校验
   * */
  checkLen ({min = 0, max = 0}) {
    return (value, done) => {
      let len = _.isEmpty(value) ? 0 : _.isNumber(value) || _.isString(value) ? ('' + value).length : _.isArray(value) ? value.length : 0
      let gtMin = min <= len
      let ltMax = len <= max
      return done(min === 0 ? (max === 0 ? true : ltMax) : (max === 0 ? gtMin : gtMin && ltMax))
    }
  },
  /*
   * 正则表达式校验
   * */
  match ({regex}) {
    return (value, done) => {
      return done(regex.test(value))
    }
  }
}