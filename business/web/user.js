
module.exports = function (app) {
  var auth = require('../../auth/user.js')(app)

  app.get('/user', auth.authenticate(), function (req, res) {
    res.json(req.user)
  })
}
