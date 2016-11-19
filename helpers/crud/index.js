const _ = require('lodash')
const moment = require('moment')
const toUnderscore = function (el) {
  return el.toString().replace(/([A-Z])/g, function ($1) { return '_' + $1.toLowerCase() })
}
const Crud = function (model) {
  return {
    create: function * () {
      var insert = this.state.query || {}

      if (this.state.user) {
        insert.user_id = this.state.user._id
      }

      insert.created_at = moment().toDate()
      insert.updated_at = moment().toDate()

      this.body = yield this.state.Models[model].insert(insert)
    },
    get: function * (id, next) {
      if (!next) {
        next = id
        id = null
      }

      var find = this.state.query || {
        _id: id
      }

      var opts = this.state.options || {}

      // Enable Search
      var filters = _.pickBy(this.query, function (value, key) {
        return _.startsWith(key, 'filter')
      })

      if (_.keys(filters).length > 0) {
        _.forEach(filters, function (value, key) {
          key = toUnderscore(key).replace('filter_', '').replace(/[^\w.]/g, '')
          find[key] = isNaN(value) ? value : Number(value)
        })
      }

      if (find._id) {
        this.body = yield this.state.Models[model].findOne(find, opts)
      } else {
        this.body = yield this.state.Models[model].find(find, opts)
      }
    },
    update: function * (id) {
      var find = this.state.query || {
        _id: id
      }

      var params = this.request.body

      this.body = yield this.state.Models[model].update(find, {
        $set: params
      })
    },
    remove: function * (id) {
      var find = this.state.query || {
        _id: id
      }

      this.body = yield this.state.Models[model].remove(find)
    }
  }
}
module.exports = Crud
