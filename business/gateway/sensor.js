
module.exports = function (app) {
  var auth = require('../auth/gateway.js')

  app.post('/gateway/data', function (req, res) {
    auth.authenticateGateway(req, res);
  })
}
