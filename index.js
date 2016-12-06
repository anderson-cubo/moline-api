const env = require('node-env-file')
const fs = require('fs')
const path = require('path')
const co = require('co')
const monk = require('monk')
const _ = require('lodash')
const stackTrace = require('stack-trace')
// Load Koa
const koa = require('koa')
const body = require('koa-body')
const route = require('koa-route')
const session = require('koa-session')
co(function * () {
  let app = koa()

  let envFile = path.join(__dirname, '.env')
  let port = process.env.PORT || 9700
  let db = monk(process.env.MONGODB || process.env.MONGODB_URI || 'localhost/moline')

  // Load .env file
  if (fs.existsSync(envFile)) {
    env(envFile)
  }

  let routes = require('./routes')
  let events = require('./events')
  // let Mail = require('./helpers/mail')()

  // This must come after last app.use()
  let server = require('http').Server(app.callback())
  let io = require('socket.io')(server)

  io.on('connection', function (socket) {
    events(socket)
  })

  // load body parse
  app.use(body({formidable: { uploadDir: __dirname }}))
  app.keys = ['SMSCRT871Ah711g1BAA8hJ782625']
  app.use(session(app))
  app.use(function * (next) {
    if (this.path === '/favicon.ico') return void (0)
    this.state.db = db
    // this.state.Mail = Mail

    this.state.Models = {
      User: db.get('users'),
      Room: db.get('rooms'),
      Chat: db.get('chats'),
      Joined: db.get('joined')
    }
    this.state.id = function (id) {
      return monk.id(id)
    }

    this.ErrorException = function (message, status) {
      this.message = message
      this.name = 'errorException'
      this.status = status || 200
    }
    this.set('Access-Control-Allow-Origin', this.request.header.origin || '*')
    this.set('Access-Control-Allow-Headers', this.request.header['access-control-request-headers'] || '*')
    this.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
    this.set('Access-Control-Allow-Credentials', 'true')
    this.set('Allow', 'POST, GET, OPTIONS, PUT, DELETE')
    this.set('Server', 'Moline API')

    if (this.method === 'OPTIONS') {
      this.body = ''
      return
    }

    try {
      yield next
    } catch (err) {
      if (err.name && err.name === 'errorException') {
        this.response.status = err.status
        this.body = { error: err.message }
      } else {
        console.error(stackTrace.parse(err))
        console.error(err)
      }
    }
  })
  routes(_.mapValues(route, function (act, key) {
    return function () {
      app.use(route[key].apply(null, arguments))
    }
  }))
  server.listen(port, process.env.HOST || '0.0.0.0')
  console.log('Listening at port:', port)
})

