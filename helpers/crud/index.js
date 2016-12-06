const _ = require('lodash')
const moment = require('moment')
const toUnderscore = function (el) {
  return el.toString().replace(/([A-Z])/g, function ($1) { return '_' + $1.toLowerCase() })
}
const Crud = function (model) {
  return {
    create: function * () {
      var insert = this.state.query || this.request.body
      var __id = this.state.id
      if (this.state.user) {
        insert.user_id = this.state.user._id
      }

      _.forOwn(insert, function (find, key) {
        if (~key.indexOf('_id')) {
          insert[key] = __id(insert[key])
        }
      })

      insert.created_at = moment().toDate()
      insert.updated_at = moment().toDate()

      if (insert.date) {
        insert.date = new Date(insert.date)
      }

      this.body = yield this.state.Models[model].insert(insert)
    },
    get: function * (id, next) {
      if (!next) {
        next = id
        id = void (0)
      }
      var __id = this.state.id
      var find = this.state.query || (id ? { _id: id } : {})

      var opts = this.state.options || {}

      // Enable Search
      if (this.query.filterDate) {
        let date = this.query.filterDate
        find.date = {
          $gte: moment(date, 'DD/MM/YYYY').subtract(1, 'day').toDate(),
          $lt: moment(date, 'DD/MM/YYYY').add(1, 'day').toDate()
        }
        delete this.query.filterDate
      }
      var filters = _.pickBy(this.query, function (value, key) {
        return _.startsWith(key, 'filter')
      })

      if (_.keys(filters).length > 0) {
        _.forEach(filters, function (value, key) {
          key = toUnderscore(key).replace('filter_', '').replace(/[^\w.]/g, '')
          find[key] = isNaN(value) ? value : Number(value)
          if (~key.indexOf('_id')) {
            find[key] = __id(value)
          }
        })
      }
      console.log(find)
      if (find._id) {
        this.body = yield this.state.Models[model].findOne(find, opts)
      } else {
        this.body = yield this.state.Models[model].find(find, opts)
      }
    },
    update: function * (id) {
      var __id = this.state.id
      var find = this.state.query || {
        _id: id
      }


      var params = this.request.body

      _.forOwn(params, function (find, key) {
        if (~key.indexOf('_id')) {
          params[key] = __id(params[key])
        }
      })

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
