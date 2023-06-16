module.exports = function (app) {
  var auth = require('../auth/user.js')(app)

  app.get('/web/farm/:code', auth.authenticate(), function (req, res) {
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

  app.get('/web/farms/user/:emailUser', auth.authenticate(), function (req, res) {
    var Farm = app.db.model('Farm')
    Farm.find().populate({
      path: 'users.user',
      match: {
        email: req.params.emailUser
      }
    }).exec(function (err, farms) {
      if (err) {
        res.status(500).send(err)
      } else {
        farms = farms.filter(function (farm) {
          for (var i in farm.users.reverse()) {
            if (farm.users[i].user && farm.users[i].user.email === req.params.emailUser) {
              farm.users = farm.users[i]
              return farm
            }
          }
        })
        return res.status(200).json(farms)
      }
    })
  })
}
