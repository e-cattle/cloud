
module.exports = function (app) {
  var auth = require('../auth/user.js')(app)
  var admin = require('../../admin.js')

  app.get('/manager/user', auth.authenticate(), admin(), async function (req, res) {
    res.status(200).json({
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
      created: req.user.created,
      changed: req.user.changed
    })
  })
  /* Busca todos usuários */
  app.get('/manager/users', auth.authenticate(), admin(), function (req, res) {
    var User = app.db.model('User')
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
  /* Busca usuário com EMAIL passado como parâmetro  */
  app.get('/manager/users/:email', auth.authenticate(), admin(), function (req, res) {
    var User = app.db.model('User')
    User.find({ email: { $regex: req.params.email, $options: 'i' } }, function (error, users) {
      if (error) {
        console.log('error: ' + error)
        res.send(error)
      } else {
        console.log('users: ' + users)
        res.json(users)
      }
    })
  })
  /* Altera flag admin do usuário com EMAIL passado como parâmetro */
  app.put('/manager/switch', auth.authenticate(), admin(), function (req, res) {
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
