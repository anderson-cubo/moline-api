const Mailgun = require('mailgun').Mailgun
const handlebars = require('handlebars')
const mailcomposer = require('mailcomposer')
const fs = require('fs')
const _ = require('lodash')
module.exports = function () {
  console.log(process.env.MAIL_TOKEN)
  let mg = new Mailgun(process.env.MAIL_TOKEN)
  let sendMail = function (from, to, name, subject, html) {
    from = from || process.env.MAIL_FROM || 'noreply@tresna.co'
    let objSend = {
      from: from,
      subject: subject,
      to: to,
      html: html
    }
    // console.log(objSend)
    let mail = mailcomposer(objSend)
    return mail.build(function (err, mail) {
      if (err) console.warn(err)
      mg.sendRaw(from, to, mail, function (err) { err && console.warn(err) })
    })
  }
  return {
    sendMail: sendMail,
    form: function (opts) {
      let mail = __dirname + '/../../templates/mails/form.hbs'
      opts.iteratee = _.map(opts.iteratee, function (obj, key) {
        return {
          key: key,
          val: obj
        }
      })
      mail = fs.readFileSync(mail)
      mail = handlebars.compile(mail.toString())(opts)
      sendMail(
        null,
        opts.to,
        opts.to,
        opts.title || 'New submission',
        mail
      )
    }
  }
}
