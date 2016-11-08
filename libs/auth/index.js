const bcrypt = require('bcrypt-nodejs')
const uuid = require('uuid')
const moment = require('moment')
const validator = require('validator')
const _genAuth = function () {
  return {
    auth: uuid.v4(),
    token: uuid.v4()
  }
}
const Auth = {
  register: function * () {
    /* reqBody = {
      email: string,
      password: string,
      name: string
    } */
    let reqBody = this.request.body || {}
    let User = this.state.Models.User
    let hasUser = null

    if (!validator.isEmail(reqBody.email || '')) {
      throw new this.ErrorException('This is not an email.')
    }

    if (!reqBody.password) {
      throw new this.ErrorException('You should send an password.')
    }

    hasUser = yield User.findOne({ email: reqBody.email })

    if (hasUser) {
      throw new this.ErrorException('This user already exists.')
    }
    reqBody.tokens = [_genAuth()]
    reqBody.password = bcrypt.hashSync(reqBody.password)
    reqBody.created_at = moment().toDate()
    reqBody.updated_at = moment().toDate()
    yield User.insert(reqBody)
    this.session.token = reqBody.tokens[0]
    delete reqBody.password
    this.body = reqBody
  },
  $logged: function * () {
    let user = yield Auth.$get.apply(this, [])
    return Boolean(user)
  },
  logged: function * () {
    var logged = yield Auth.$logged.apply(this, [])
    this.body = { logged: logged }
  },

  $get: function * (email) {
    let User = this.state.Models.User
    let q = { tokens: this.session.token }
    if (email) {
      q = { email: email }
    }
    return yield User.findOne(q)
  },
  get: function * () {
    let user = yield Auth.$get.apply(this, [])
    if (!user) {
      throw new this.ErrorException('You are not logged.')
    }
    this.body = user
    delete this.body.password
    delete this.body.tokens
  },
  update: function * () {
    let User = this.state.Models.User
    let reqBody = this.request.body || {}
    if (yield Auth.$logged.apply(this, [])) {
      let user = yield Auth.$get.apply(this, [])
      if (reqBody.payment !== void (0)) {
        delete reqBody.payment
      }
      if (reqBody.password) {
        reqBody.password = bcrypt.hashSync(reqBody.password)
      }
      reqBody.updated_at = moment().toDate()
      yield User.update({ _id: user._id }, { $set: reqBody })
      this.body = user
      delete this.body.password
      delete this.body.tokens
    } else {
      throw new this.ErrorException('You are not logged.')
    }
  },
  login: function * () {
    let reqBody = this.request.body || {}
    let User = this.state.Models.User
    let user = null

    if (!validator.isEmail(reqBody.email || '')) {
      throw new this.ErrorException('This is not an email.')
    }

    if (!reqBody.password) {
      throw new this.ErrorException('You should send an password.')
    }

    user = yield Auth.$get.apply(this, [reqBody.email])
    // console.log(user)
    if ((!user) || (!bcrypt.compareSync(reqBody.password, user.password))) {
      throw new this.ErrorException('Username or password wrong.')
    }
    var _token = _genAuth()
    this.session.token = _token
    yield User.update({ _id: user._id }, { $push: { tokens: _token } })
    this.body = { logged: true }
  }
}
module.exports = Auth
