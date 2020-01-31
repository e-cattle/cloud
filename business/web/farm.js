
var timestamp = require('unix-timestamp')

module.exports = function (app) {
  var auth = require('../../auth.js')(app)

  app.get('/simulations', auth.authenticate(), function (req, res) {
    var Simulation = app.db.model('Simulation')

    Simulation.find({ user: req.user._id }, function (err, simulations) {
      if (err) { res.send(err) }

      res.json(simulations)
    })
  })

  app.post('/simulation', auth.authenticate(), function (req, res) {
    if (!req.body.type || req.body.type.length === 0) { return res.status(500).json('This type is not supported!') }

    var contract = require('../contract/' + req.body.type + '.json')

    var Simulation = app.db.model('Simulation')

    var simulation = (new Simulation()).toObject()

    delete simulation._id

    simulation.code = req.body.code
    simulation.name = req.body.name
    simulation.type = req.body.type
    simulation.farm = req.body.farm
    simulation.city = req.body.city
    simulation.state = req.body.state
    simulation.user = req.user
    simulation.created = new Date(req.body.created)
    simulation.changed = new Date(req.body.changed)
    simulation.active = req.body.active

    simulation.synched = new Date()

    for (var property in contract) {
      if (contract.hasOwnProperty(property)) { simulation[property] = req.body[property] }
    }

    Simulation.findOneAndUpdate({ code: simulation.code, changed: { $lt: simulation.changed } }, { $set: simulation }, { upsert: true, setDefaultsOnInsert: true }, function (error) {
      if (error) { res.send(error) } else { res.status(200).json('Done to ' + simulation.code + '!') }
    })
  })

  app.get('/simulations/:date', auth.authenticate(), function (req, res) {
    var date = timestamp.toDate(req.params.date)

    var Simulation = app.db.model('Simulation')

    Simulation.find({ user: req.user._id, synched: { $gt: date } }, function (err, simulations) {
      if (err) { res.send(err) }

      res.json(simulations)
    })
  })
}
