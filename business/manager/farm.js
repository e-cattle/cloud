// var timestamp = require('unix-timestamp')

module.exports = function (app) {
  var auth = require('../../auth.js')(app)
  var admin = require('../../admin.js')

  app.get('/manager/farms', auth.authenticate(), admin(), function (req, res) {
    var Farm = app.db.model('Farm')
    Farm.find({}, function (err, farms) {
      if (err) { return res.status(500).send({ error: 'Erro ao buscar fazendas' }) }
      return res.send(farms)
    })
  })

  app.get('/manager/farm/:code', auth.authenticate(), admin(), function (req, res) {
    var code = req.params.code
    var Farm = app.db.model('Farm')
    Farm.findOne({ code }, function (err, farm) {
      if (err) { res.status(500).send(err) }
      return res.status(200).json(farm)
    })
  })

  /* app.get('/manager/farms/:code', auth.authenticate(), function (req, res) {
    var Farm = app.db.model('Farm')

    // verifica se o usuário que quer fazer a requisição é admininistrador
    Farm.find({ code: req.params.code }, function (error, farms) {
      if (error) {
        res.send(error)
      } else {
        console.log(farms)
        res.json(farms)
      }
    })
  }) */

  app.get('/manager/farms/:name', auth.authenticate(), admin(), function (req, res) {
    var Farm = app.db.model('Farm')

    // verifica se o usuário que quer fazer a requisição é admininistrador
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

  app.put('/manager/farm/:code', auth.authenticate(), admin(), async function (req, res) {
    var code = req.params.code
    var Farm = app.db.model('Farm')

    await Farm.findOneAndUpdate({ code }, { $set: req.body }, { upsert: true, setDefaultsOnInsert: true }, function (error) {
      if (error) { res.status(500).send(error) } else { res.status(200).json('Propriedade de Código ' + code + ' alterada com sucesso!') }
    })
  })

  app.post('/manager/farm', auth.authenticate(), admin(), async function (req, res) {
    if (!req.body.name || req.body.name.length === 0) { return res.status(500).json('This type is not supported!') }
    var Farm = app.db.model('Farm')
    var farm = (new Farm()).toObject()

    delete farm._id

    const code = await Farm.countDocuments({}, (error, count) => {
      return (error) ? res.status(500).send(error) : (++count)
    })

    farm.code = code
    farm.name = req.body.name
    farm.city = req.body.city
    farm.state = req.body.state
    farm.address = req.body.address
    farm.subscription = req.body.subscription
    farm.synched = req.body.synched
    farm.active = req.body.active
    farm.author = req.body.author

    await Farm.findOneAndUpdate({ code: farm.code, changed: { $lt: farm.changed } }, { $set: farm }, { $push: { users: req.body.user } }, { upsert: true, setDefaultsOnInsert: true }, function (error) {
      if (error) { res.send(error) } else { res.status(201).json('Propriedade ' + farm.name + ' criada com sucesso! código da propriedade: ' + farm.code) }
    })
  })
}
