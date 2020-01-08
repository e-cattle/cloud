
var jwt = require('jwt-simple')

var cors = require('cors')

module.exports = function (app) {
  app.options('/manager/auth/:provider', cors())

  app.post('/manager/auth/:provider', cors(), function (req, res) {
    try {
      var provider = require('../../social/' + req.params.provider)(app)

      console.log('Calling ' + req.params.provider)

      var user = provider.login(req, res)

      return res.json({ token: jwt.encode({ email: user.email, date: Date.now }, process.env.SECRET_ADM) })
    } catch (ex) {
      return res.status(500).json(ex)
    }
  })
}
