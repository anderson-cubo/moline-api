const Auth = require('./libs/auth')

module.exports = function (router) {
  router.all('/', function * () {
    this.body = {
      version: '0.1.0'
    }
  })
  router.get('/user', Auth.get)
  router.post('/user/register', Auth.register)
  router.post('/user/login', Auth.login)
  router.put('/user', Auth.update)
  router.all('/user/logged', Auth.logged)
}
