const Auth = require('./libs/auth')
const User = require('./libs/user')
const Crud = require('./helpers/crud')
const Upload = require('./helpers/upload')
const RoomCrud = Crud('Room')
const ChatCrud = Crud('Chat')
const JoinedCrud = Crud('Joined')
module.exports = function (router) {
  router.all('/', function * () {
    this.body = {
      version: '0.2.2'
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
  router.get('/room/:id', RoomCrud.get)
  router.put('/room/:id', RoomCrud.update)
  router.delete('/room/:id', RoomCrud.remove)

  router.get('/chat', ChatCrud.get)
  router.get('/chat/:id', ChatCrud.get)
  router.post('/chat', ChatCrud.create)
  router.delete('/chat/:id', ChatCrud.remove)

  router.get('/joined', JoinedCrud.get)
  router.get('/joined/:id', JoinedCrud.get)
  router.post('/joined', JoinedCrud.create)
  router.delete('/joined/:id', JoinedCrud.remove)

  router.post('/upload', Upload)
}
