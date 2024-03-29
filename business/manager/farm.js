module.exports = function (app) {
  var auth = require('../auth/user.js')(app)
  var admin = require('../../admin.js')

  /* Busca todas propriedades do sistema */
  app.get('/manager/farms', auth.authenticate(), admin(), function (_req, res) {
    var Farm = app.db.model('Farm')
    Farm.find({}).populate('users.user').exec(function (err, farms) {
      if (err) { return res.status(500).send({ error: 'Erro ao buscar fazendas' }) }
      return res.send(farms)
    })
  })
  /* Busca propriedade específica através de seu CODE */
  app.get('/manager/farm/:code', auth.authenticate(), admin(), function (req, res) {
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

  /* Busca quais propriedades possuem o email passado como parâmetro nos usuários */
  app.get('/manager/farms/user/:emailUser', auth.authenticate(), admin(), function (req, res) {
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

  /* Busca de fazendas pela string passada como parâmetro */
  app.get('/manager/farms/:name', auth.authenticate(), admin(), function (req, res) {
    var Farm = app.db.model('Farm')

    /* Utiliza expressão regular indicando que a busca é case-insensitive */
    Farm.find({ name: { $regex: req.params.name, $options: 'i' } }, function (error, farms) {
      if (error) {
        console.log('error: ' + error)
        res.send(error)
      } else {
        console.log('farms: ' + farms)
        res.json(farms)
      }
    })
  })
  /* Edição de fazenda pelo CODE passado como parâmetro */
  app.put('/manager/farm/:code', auth.authenticate(), admin(), async function (req, res) {
    var code = req.params.code
    var Farm = app.db.model('Farm')

    await Farm.findOneAndUpdate({ code }, { $set: req.body }, { upsert: true, setDefaultsOnInsert: true }, function (error) {
      if (error) { res.status(500).send(error) } else { res.status(200).json('Propriedade de Código ' + code + ' alterada com sucesso!') }
    })
  })

  /* Criação de fazenda */
  app.post('/manager/farm', auth.authenticate(), admin(), async function (req, res) {
    if (!req.body.name || req.body.name.length === 0) { return res.status(500).json('This type is not supported!') }
    var Farm = app.db.model('Farm')
    var farm = new Farm()
    delete farm._id
    farm.name = req.body.name
    farm.city = req.body.city
    farm.state = req.body.state
    farm.address = req.body.address
    farm.subscription = req.body.subscription
    farm.synched = req.body.synched
    farm.active = req.body.active
    farm.author = req.body.author
    farm.users = req.body.users
    await farm.save(async err => {
      if (!err) {
        await Farm.nextCount()
          .then(async nextCode => {
            if (nextCode === undefined) { return res.status(500).json('Erro ao gerar próximo code') }
            farm.code = nextCode
            await Farm.find({ code: farm.code }, function (error) {
              if (error) { res.send(error) } else { res.status(201).json('Propriedade ' + farm.name + ' criada com sucesso! código da propriedade: ' + farm.code) }
            })
          })
          .catch(async e => {
            console.log(e)
          })
      } else {
        res.status(500).json('Erro ao gerar código da propriedade')
      }
    })
  })
}
