/**
 * Created by liljay on 2017/8/16.
 */
const Router = require('koa-router')
const router = new Router()
const multer = require('koa-multer')
const path = require('path')

const dest = '/avatar/'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../static', dest))
  },
  filename: function (req, file, cb) {
    let originalName = file.originalname
    cb(null, file.fieldname + '-' + Date.now() + originalName.substr(originalName.lastIndexOf('.')))
  }
})

const upload = multer({ storage: storage })

router.post('/', upload.single('avatar'), (ctx) => {
  ctx.body = {
    avatar: dest + ctx.req.file.filename
  }
})

module.exports = router

