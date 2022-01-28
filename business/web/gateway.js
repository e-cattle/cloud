module.exports = function (app) {
  var auth = require('../../auth.js')(app)

  /* Busca todos Middlewares vinculados na propriedade de CODE passado como parâmetro */
  app.get('/web/gateways/:codeFarm', auth.authenticate(), async function (req, res) {
    var codeFarm = req.params.codeFarm
    var Gateway = app.db.model('Gateway')

    await Gateway.find().populate({
      path: 'farm',
      match: {
        code: codeFarm
      }
    }).populate('author').exec(function (err, gateways) {
      gateways = gateways.filter(g => g.farm)
      if (err) { res.status(500).send(err) }
      return res.status(200).json(gateways)
    })
  })
  /* Busca Middleware específico através de seu MAC */
  app.get('/web/gateway/:mac', auth.authenticate(), function (req, res) {
    var mac = req.params.mac
    var Gateway = app.db.model('Gateway')
    Gateway.findOne({ mac }, function (err, gateway) {
      if (err) { res.status(500).send(err) }
      return res.status(200).json(gateway)
    })
  })
  /* Deleta Middleware específico através de seu MAC */
  app.delete('/web/gateway/:mac', auth.authenticate(), function (req, res) {
    console.log(req.params)
    var mac = req.params.mac
    var Gateway = app.db.model('Gateway')
    Gateway.deleteOne({ mac: mac }, function (err, gateway) {
      if (err) { return res.status(500).send(err) }
      return res.status(200).json('Gateway de MAC ' + gateway.mac + ' deletado')
    })
  })
  /* Edição de Middleware pelo MAC passado como parâmetro */
  app.put('/web/gateway/:mac', auth.authenticate(), async function (req, res) {
    var mac = req.params.mac
    var Gateway = app.db.model('Gateway')

    await Gateway.findOneAndUpdate({ mac }, { $set: req.body }, { upsert: true, setDefaultsOnInsert: true }, function (error) {
      if (error) { res.status(500).send(error) } else { res.status(200).json('Gateway de MAC ' + mac + ' alterado com sucesso!') }
    })
  })
}
