/**
 * Created by linxiaojie on 2017/6/30.
 */
class BaseDao {
  static async pageQuery (model, {page = 1, pageSize = 10, populate = '', queryParam = {}, sortParam = '-createdAt'}) {
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