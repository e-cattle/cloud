
module.exports = function (app) {
  var auth = require('../../auth.js')(app)
  var admin = require('../../admin.js')

  app.get('/manager/user', auth.authenticate(), admin(), async function (req, res) {
    var NewUser = app.db.model('NewUser')
    var Farm = app.db.model('Farm')
    /* Verifica se o usuário logado possui vínculo pendente como usuário de alguma farm.
    Em seguida já o adiciona no array de Users da Farm com seu papel */
    await NewUser.find({ email: req.user.email }, function (error, newUsers) {
      if (error) {
        res.send(error)
      } else {
        newUsers.forEach(newUser => {
          Farm.findOneAndUpdate({ _id: newUser.farm }, { $push: { users: { user: req.user, role: newUser.role } } }, async function (error) {
            if (error) {
              res.status(500).send(error)
            } else {
              await NewUser.findOneAndDelete({ _id: newUser._id }, function (error) {
                if (!error) res.status(200).json('Usuário deletado da lista de usuários')
              })
              res.status(200).json('Usuário vinculado com sucesso à propriedade ' + newUser.farm)
            }
          })
        })
      }
    })

    res.status(200).json({
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
      created: req.user.created,
      changed: req.user.changed
    })
  })

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
