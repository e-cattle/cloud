
var cors = require('cors')

module.exports = function (app) {
  app.options('/auth/:provider', cors())

  app.post('/auth/:provider', cors(), function (req, res) {
    try {
      var provider = require('../../social/' + req.params.provider)(app)

      console.log('Calling ' + req.params.provider)

      provider.login(req, res)
    } catch (ex) {
      return res.status(500).json(ex)
    }
  })
}
