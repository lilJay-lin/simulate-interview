/**
 * Created by linxiaojie on 2017/6/30.
 */
const mongoose = require('../mongoose')
const _ = require('lodash')
class BaseDao {
  constructor (name) {
    this.modelName = name
  }
  document (doc) {
    return mongoose.document(this.modelName, doc)
  }
  model () {
    return mongoose.model(this.modelName)
  }
  caseObjectId (id) {
    return mongoose.mongoose.Types.ObjectId(_.padEnd(id, 12, 'x'))
  }
  async add (entity) {
    delete entity._id
    const doc = this.document(entity)
    await doc.save()
    return doc
  }
  async batch (queryParam, set = {}) {
    const model = this.model()
    const docs = await model.update(queryParam, {$set: set}, {multi: true, runValidators: true, context: 'query'}).exec()
    return docs
  }
  async update (queryParam, doc = {}) {
    const model = this.model()
    if (doc._id) {
      delete doc._id
    }
    const docs = await model.update(queryParam, doc, {multi: true, runValidators: true, context: 'query'}).exec()
    return docs
  }
  async find (queryParam) {
    const model = this.model()
    if (queryParam.status === undefined) {
      queryParam.status = '1'
    }
    const docs = await model.find(queryParam).exec()
    return docs
  }
  async findPopulate ({queryParam = {}, populate = ''}) {
    const model = this.model()
    if (queryParam.status === undefined) {
      queryParam.status = '1'
    }
    const query = model.find(queryParam).populate(populate)
    if (_.isArray(populate)) {
      _.each(populate, (p) => {
        query.populate(p)
      })
    }
    const docs = await query.exec()
    return docs
  }
  async pageQuery ({page = 1, pageSize = 10, populate = '', queryParam = {}, sortParam = '-createdAt'}) {
    const model = this.model()
    if (!model) {
      return {
        records: [],
        pageInfo: {
          currentPage: 1,
          totalRow: 0,
          totalPage: 0
        }
      }
    }
    page = parseInt(page, 10)
    pageSize = parseInt(pageSize, 10)
    const start = (page - 1) * pageSize
    const rows = await model.count(queryParam).exec()
    const query = model.find(queryParam).skip(start).limit(pageSize)
    if (_.isArray(populate)) {
      _.each(populate, (p) => {
        query.populate(p)
      })
    }
    let records = await query.sort((sortParam)).exec()
    records = _.map(records, (record) => {
      return record.toObject()
    })
    return {
      records,
      pageInfo: {
        currentPage: page,
        pageSize,
        totalRow: rows,
        totalPage: Math.floor((rows - 1) / pageSize) + 1
      }
    }
  }
}
module.exports = BaseDao