module.exports = function * () {
  try {
    console.log(this.request.body)
    var many = {}
    if (this.request.body.files) {
      for (var key in this.request.body.files) {
        let file = this.request.body.files[key]
        many[key] = file.path.split(/[\\\/]/).pop()
      }
      this.body = many
    } else {
      this.body = { error: 'No file sent' }
    }
  } catch (err) {
    console.log('errrrrrrr')
    console.log(err)
    console.log('errrrrrrr')
  }
}
