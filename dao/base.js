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
    const doc = this.document(entity)
    await doc.save()
    return doc
  }
  async delete (queryParam) {
    const model = this.model()
    let docs = await model.update(queryParam, {$set: {status: false}}, { multi: true })
    return docs
  }
  async update (queryParam, doc = {}) {
    const model = this.model()
    let docs = await model.update(queryParam, doc, { multi: true })
    return docs
  }
  async find (queryParam) {
    const model = this.model()
    let docs = await model.find(queryParam)
    return docs
  }
  async pageQuery ({page = 1, pageSize = 10, populate = '', queryParam = {}, sortParam = '-createdAt'}) {
    let model = this.model()
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
    let rows = await model.count(queryParam)
    let records = await model.find(queryParam).skip(start).limit(pageSize).populate(populate).sort((sortParam))
    return {
      records,
      pageInfo: {
        currentPage: page,
        totalRow: rows,
        totalPage: Math.floor((rows - 1) / pageSize) + 1
      }
    }
  }
}
module.exports = BaseDao