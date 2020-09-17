module.exports = function (app) {
  var auth = require('../../auth.js')(app)

  app.get('/manager/gateways/:codeFarm', auth.authenticate(), function (req, res) {
    var codeFarm = req.params.codeFarm
    var Gateway = app.db.model('Gateway')

    Gateway.find().populate({
      path: 'farm',
      match: {
        code: codeFarm
      }
    }).exec(function (err, gateways) {
      if (err) { res.status(500).send(err) }
      return res.status(200).json(gateways)
    })
  })

  app.get('/manager/gateway/:mac', auth.authenticate(), function (req, res) {
    var mac = req.params.mac
    var Gateway = app.db.model('Gateway')
    Gateway.findOne({ mac }, function (err, gateway) {
      if (err) { res.status(500).send(err) }
      return res.status(200).json(gateway)
    })
  })

  app.put('/manager/gateway/:mac', auth.authenticate(), async function (req, res) {
    var mac = req.params.mac
    var Gateway = app.db.model('Gateway')

    await Gateway.findOneAndUpdate({ mac }, { $set: req.body }, { upsert: true, setDefaultsOnInsert: true }, function (error) {
      if (error) { res.status(500).send(error) } else { res.status(200).json('Gateway de Código ' + mac + ' alterado com sucesso!') }
    })
  })

  app.post('/manager/gateway', auth.authenticate(), async function (req, res) {
    if (!req.body.mac || req.body.mac.length === 0) { return res.status(500).json('This type is not supported!') }
    var Gateway = app.db.model('Gateway')
    var gateway = (new Gateway()).toObject()

    delete gateway._id

    gateway.mac = req.body.mac
    gateway.description = req.body.description
    gateway.active = req.body.active
    gateway.farm = req.body.farm
    gateway.created = req.body.created
    gateway.changed = req.body.changed
    gateway.author = req.body.author

    await Gateway.findOneAndUpdate({ mac: gateway.mac, changed: { $lt: gateway.changed } }, { $set: gateway }, { upsert: true, setDefaultsOnInsert: true }, function (error) {
      if (error) { res.send(error) } else { res.status(201).json('Propriedade ' + gateway.name + ' criada com sucesso! código da propriedade: ' + gateway.code) }
    })
  })
}
