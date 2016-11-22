const Auth = require('./libs/auth')
const User = require('./libs/user')
const Crud = require('./helpers/crud')
const RoomCrud = Crud('Room')
const ChatCrud = Crud('Chat')
module.exports = function (router) {
  router.all('/', function * () {
    this.body = {
      version: '0.2.0'
    }
  })
  router.get('/user', Auth.get)
  router.post('/user/register', Auth.register)
  router.post('/user/login', Auth.login)
  router.put('/user', Auth.update)
  router.all('/user/logged', Auth.logged)

  // after that has to be logged
  router.all('*', User.getOrFail)

  router.get('/rooms', RoomCrud.get)
  router.get('/room', RoomCrud.get)
  router.post('/room', RoomCrud.create)
  router.put('/room/:id', RoomCrud.update)
  router.delete('/room/:id', RoomCrud.remove)

  router.get('/chat', ChatCrud.get)
  router.get('/chat/:id', ChatCrud.get)
  router.post('/chat', ChatCrud.create)
  router.delete('/chat/:id', ChatCrud.remove)



}
