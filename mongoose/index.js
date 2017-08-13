var glob = require("glob")
var util = require('util')
var mongoose = require('mongoose')
mongoose.Promise = Promise

var middleware = module.exports = options => {
  mongoose = options.mongoose ? options.mongoose : mongoose
  //mode: model
  var db = mongoose.connection
  middleware.models = {}
  middleware.dbs = {}
  if (options.schemas) {
    //mode: schema
    db = mongoose.createConnection()
    var schemas = options.schemas + (options.schemas.lastIndexOf('/') === (options.schemas.length - 1) ? '' : '/')
    var files = glob.sync(schemas + '**/*.js')
    files.map(file => {
      var model = file
        .replace(/[^\/]*\//g, '')
        .replace(/\.js$/g, '')
        .replace(/\//g, '.')
        .toLowerCase()
      var schema = require(file)
      middleware.models[model] = db.model(model, schema)
    })
  }
  var database = typeof options.database === 'function' ? options.database(this) : options.database
  middleware.database = database
  middleware.open(db, options)
  return function (cxt, next) {

    cxt.model = model => {
      try {
        return middleware.model(model)
      } catch(err) {
        cxt.throw(400, err.message)
      }
    }
    cxt.document = (model, document) => new (cxt.model(model))(document)
    return next()
  }
}

middleware.model = (model) => {
  var name = model.toLowerCase()

  if (!middleware.models.hasOwnProperty(name)) {
    throw new Error(util.format('Model not found: %s.%s', middleware.database, model))
  }
  return middleware.models[name]
}

middleware.document = (model, document) => {
  return new (middleware.model(model))(document)
}

middleware.mongoose = mongoose

middleware.open = (db, options) => {
  if (!options || !options.host || !options.port) {
    throw new Error('options not found')
  }

  db.on('error', err => {
    db.close();
  });

  db.once('open', function() {
    // we're connected!
    console.log('mongodb is connected')
    options.initData && options.initData(middleware)
  });

  db.open(options.host, middleware.database, options.port, options.opt)

  return db
}
