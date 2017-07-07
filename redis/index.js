/**
 * Created by linxiaojie on 2017/7/7.
 */
const redis = require('redis')
let client = null
let middleware = module.exports = () => {
  client = redis.createClient({
    retry_strategy: function (options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        // End reconnecting on a specific error and flush all commands with a individual error
        return new Error('The redis server refused the connection');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after a specific timeout and flush all commands with a individual error
        return new Error('Redis retry time exhausted');
      }
      if (options.attempt > 10) {
        // End reconnecting with built in error
        return new Error('Redis built in error');
      }
      // reconnect after
      return Math.min(options.attempt * 100, 3000);
    }
  });

  client.once('ready', () => {
    console.log('redis ready')
  })

  client.on("error", function (err) {
    console.log("Redis Error: " + err.message);
  });
  return (cxt, next) => {
    cxt.redis = middleware
    return next()
  }
}

/*
* 默认半个钟失效
* */
middleware.set = (key, val, second = 1800) => {
  return new Promise((resolve, reject) => {
    /*client.set(key, val, 'ex', String(second), (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(1)
    })*/
    client.set(key, val, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(1)
    })
  }).catch((err) => {
    console.log(err)
    return !1
  })
}

middleware.get = (key) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, value) => {
      if (err) {
        reject(err)
        return
      }
      resolve(value)
    })
  })
}