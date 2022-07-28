/*
  Os usuários que são adicionados via aplicação "Sistema de Gestão de Inquilinos" vão para uma
  "fila" de novos usuários representada pela Collection "new-user".
  Esses novos usuários só serão vinculados de fato na Collection "farm" após o primeiro login na aplicação "Portal Web".
*/
module.exports = function (app) {
  var auth = require('../../auth.js')(app)
  var admin = require('../../admin.js')
  /* Busca todos da "fila" de novos usuários */
  app.get('/manager/new-users', auth.authenticate(), admin(), function (req, res) {
    var NewUser = app.db.model('NewUser')

    NewUser.find({}, function (error, newUsers) {
      if (error) {
        console.log('error: ' + error)
        res.send(error)
      } else {
        console.log('users: ' + newUsers)
        res.json(newUsers)
      }
    })
  })
  /* Adiciona usuário na "fila" de novos usuários */
  app.post('/manager/new-user', auth.authenticate(), admin(), async function (req, res) {
    if (!req.body.email || req.body.email.length === 0) { return res.status(500).json('This type is not supported!') }
    var NewUser = app.db.model('NewUser')
    var newUser = (new NewUser()).toObject()

    newUser.name = req.body.name
    newUser.email = req.body.email
    newUser.role = req.body.role
    newUser.farm = req.body.farm
    delete newUser._id
    await NewUser.findOneAndUpdate({ email: newUser.email, farm: newUser.farm }, { $set: newUser }, { new: true, upsert: true, setDefaultsOnInsert: true }, function (error) {
      if (error) { res.send(error) } else { res.status(201).json('Usuário cadastrado na lista de usuários!') }
    })
  })
  /* Deleta usuário da "fila" de novos usuários através do EMAIL passado como parâmetro */
  app.delete('/manager/new-user/:email', admin(), function (req, res) {
    var NewUser = app.db.model('NewUser')
    NewUser.findByIdAndRemove({ email: req.params.email }, function (error, user) {
      if (error) return res.status(500).send(error)
      res.status(201).json('Usuário deletado da fila com sucesso!')
    })
  })
}
