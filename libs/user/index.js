const Auth = require('../auth')
const User = {
  getOrFail: function * (what, next) {
    var user = yield Auth.$get.apply(this, [])
    if (user) {
      this.state.user = user
      yield next
    } else {
      throw new this.ErrorException('You are not logged')
    }
  }
}
module.exports = User
