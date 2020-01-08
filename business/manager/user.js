module.exports = function (app) {
  var auth = require('../../auth/manager.js')(app)

  app.get('/manager/users', auth.authenticate(), function (req, res) {
    var User = app.db.model('User')

    // verifica se o usuário que quer fazer a requisição é admininistrador
    User.find({}, function (error, users) {
      if (error) {
        console.log('error: ' + error)
        res.send(error)
      } else {
        console.log('users: ' + users)
        res.json(users)
      }
    })
  })

  // put para tornar ou não o usuário admin
  app.put('/manager/switch', auth.authenticate(), function (req, res) {
    console.log('params = ' + req.body.email)
    var User = app.db.model('User')

    User.findOne({ email: req.body.email }, 'admin', function (err, varAdmin) {
      if (err) {
        console.log(err)
        res.send(err)
      } else {
        var newStatAdmin = !varAdmin.admin
        var update = { $set: { admin: newStatAdmin } }

        User.findOneAndUpdate({ email: req.body.email }, update, function (err, out) {
          if (err) {
            console.log('error = ' + err)
            res.send(err)
          } else {
            console.log('updated = ' + out)
            res.json({ userEmail: req.body.email, adminStat: out.admin })
          }
        })
      }
    })
  })
}
