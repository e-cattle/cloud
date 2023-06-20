
module.exports = function (app) {
  var auth = require('../auth/user.js')(app)

  app.get('/web/user', auth.authenticate(), function (req, res) {
    var NewUser = app.db.model('NewUser')
    var User = app.db.model('User')
    var Farm = app.db.model('Farm')

    /* Verifica se o usuário logado possui vínculo pendente como usuário de alguma farm.
    Em seguida já o adiciona no array de Users da Farm com seu papel */
    NewUser.find({ email: req.user.email }, async function (error, newUsers) {
      if (!error) {
        newUsers.forEach(async newUser => {
          await Farm.findOne({ _id: newUser.farm }).populate('users.user').exec(function (err, farm) {
            if (err) {
              res.status(500).send(err)
            } else {
              var indexUser = farm.users.map(function (e) {
                return e.user.email
              }).indexOf(req.user.email)
              if (indexUser !== -1) {
                farm.users[indexUser].role = newUser.role
              } else {
                let newUserToUser = req.user
                newUserToUser.name = newUser.name
                farm.users[farm.users.length] = { user: newUserToUser, role: newUser.role }
              }
              Farm.findOneAndUpdate({ _id: newUser.farm }, { users: farm.users }, async function (error) {
                if (error) return res.status(501).send('Erro ao atualizar usuarios da propriedade')
                await User.findOneAndUpdate({ _id: req.user._id }, { name: newUser.name}, async function (error) {
                  if (!error) 
                  await NewUser.findOneAndDelete({ _id: newUser._id }, function (error) {
                    if(!error) console.log('Usuário deletado da lista de usuários')
                  })
                })
              })
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

  app.get('/web/users', auth.authenticate(), function (req, res) {
    var User = app.db.model('User')
    User.find({}, function (error, users) {
      if (error) { res.send(error) } else { res.json(users) }
    })
  })
}
