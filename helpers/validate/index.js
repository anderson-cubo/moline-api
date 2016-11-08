const _ = require('lodash')
const dot = require('dot-object')
const validator = require('validator')
const _validator = {
  isBoolean: function (bool) {
    return typeof bool === 'boolean' || (
      typeof bool === 'object' && typeof bool.valueOf() === 'boolean'
    )
  },
  isString: function (val) {
    return (typeof val === 'string' || val instanceof String)
  }
}
module.exports = function (verify) {
  let _verify = dot.dot(_.clone(verify))
  var iteratee = function (iterate) {
    let errors = []
    let valid = []
    let notChecked = []
    let _iterate = dot.dot(_.clone(iterate))
    for (let key in _iterate) {
      let data = _iterate[key]
      let ver = _verify[key]
      let _push = {}
      if (ver) {
        let validatorade = (_validator[ver] || validator[ver])
        if (validatorade) {
          if (validatorade(data)) {
            _push[key] = data
            valid.push(_push)
          } else {
            _push[key] = 'Is not a ' + ver
            errors.push(_push)
          }
        }
      } else {
        _push[key] = data
        notChecked.push(_push)
      }
    }
    return {
      errors: errors,
      valid: valid,
      notChecked: notChecked
    }
  }
  return {
    validate: iteratee
  }
}
