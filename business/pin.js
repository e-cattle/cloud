var cors = require('cors')
var mail = require('nodemailer')
var jwt = require('jwt-simple')

module.exports = function (app) {
  app.post('/pin', cors(), function (req, res) {
    if (!req.body.email || req.body.email.trim().length === 0 || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
      return res.status(400).json({ code: 'EMAIL_EMPTY_OR_INVALID' })
    }

    var Pin = app.db.model('Pin')

    var pin = new Pin()

    pin.email = req.body.email.trim()
    pin.pin = Math.floor(100000 + Math.random() * 900000)

    const transporter = mail.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false
    })
    const system = req.body.system || ' ambiente nuvem do e-Cattle'
    transporter.verify(function (error, success) {
      if (error) { return res.status(500).json({ code: 'SMTP_SERVER_UNREACHABLE', info: error }) }

      pin.save((error) => {
        if (error) { return res.status(500).json({ code: 'IMPOSSIBLE_TO_SAVE_PIN', info: error }) }

        transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: pin.email,
          subject: `${pin.pin} - PIN de autenticação no ${system}.`,
          text: `${pin.pin} é seu PIN para autenticação no sistema ${system}.`,
          html: '<h1 style="font-family: Courier New, Courier, Lucida Sans Typewriter, Lucida Typewriter, monospace; text-align: center; font-weight: bold; color: #060;">' + pin.pin + '</h1>' +
            '<h2 style="font-family: Georgia,Times,Times New Roman,serif; text-align: center;">Este é seu PIN para autenticação no sistema e-Cattle Manager!</h2>'
        }, (error, info) => {
          if (error) { return res.status(500).json({ code: 'ERROR_TO_SEND_MAIL', info: error }) }

          return res.status(200).json({ code: 'MAIL_WITH_PIN_SENDED', info: info })
        })
      })
    })
  })

  app.post('/authenticate', cors(), function (req, res) {
    if (!req.body.email || req.body.email.trim().length === 0 || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
      return res.status(400).json({ code: 'EMAIL_EMPTY_OR_INVALID' })
    }

    if (!req.body.pin || req.body.pin.trim().length !== 6) {
      return res.status(400).json({ code: 'PIN_EMPTY_OR_INVALID' })
    }

    var Pin = app.db.model('Pin')

    Pin.findOne({ email: req.body.email.trim(), pin: req.body.pin.trim() }, {}, { sort: { date: -1 } }, function (error, data) {
      if (error) { return res.status(400).json({ code: 'IMPOSSIBLE_TO_CHECK_PIN', info: error }) }

      if (!data) { return res.status(403).json({ code: 'INCORRECT_PIN' }) }

      const day = 60 * 60 * 24 * 1000 // 1 day

      if (((new Date()) - data.date) > day) { return res.status(403).json({ code: 'EXPIRED_PIN' }) }

      var User = app.db.model('User')

      User.findOne({ email: data.email }, function (error, data) {
        if (error) return res.status(500).json({ code: 'IMPOSSIBLE_TO_GET_USER', info: error })

        if (!data) {
          var user = new User()

          user.email = req.body.email.trim()

          user.save(function (error) {
            if (error) return res.status(500).json({ code: 'IMPOSSIBLE_TO_SAVE_USER', info: error })

            return res.json({ token: jwt.encode({ email: req.body.email.trim(), date: Date.now, type: 'USER' }, process.env.JWT_SECRET) })
          })
        } else return res.json({ token: jwt.encode({ email: data.email, date: Date.now, type: 'USER' }, process.env.JWT_SECRET) })
      })
    })
  })
}
