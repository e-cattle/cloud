
module.exports = function (app) {
  var auth = require('../../auth/user.js')(app)

  app.post('/gateway/data', auth.authenticate(), function (req, res) {
  })
}
