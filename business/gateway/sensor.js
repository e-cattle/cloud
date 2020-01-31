
module.exports = function (app) {
  var auth = require('../../auth.js')(app)

  app.post('/gateway/data', auth.authenticate(), function (req, res) {
  })
}
