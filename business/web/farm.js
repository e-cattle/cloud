module.exports = function (app) {
  var auth = require('../../auth.js')(app)
  var admin = require('../../admin.js')

  app.get('/web/farm/:code', auth.authenticate(), admin(), function (req, res) {
    var code = req.params.code
    var Farm = app.db.model('Farm')

    Farm.findOne({ code }).populate('users.user').exec(function (err, farms) {
      if (err) {
        res.status(500).send(err)
      } else {
        return res.status(200).json(farms)
      }
    })
  })
}
