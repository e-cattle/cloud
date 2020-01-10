
var cors = require('cors')

module.exports = function (app) {
  app.options('/manager/auth/:provider', cors())

  app.post('/manager/auth/:provider', cors(), function (req, res) {
    try {
      var provider = require('../../social/' + req.params.provider)(app)

      provider.login(req, res)
    } catch (ex) {
      return res.status(500).json(ex)
    }
  })
}
