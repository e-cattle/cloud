var timestamp = require('unix-timestamp')

module.exports = function (app) {
  var auth = require('../../auth/user.js')(app)

  app.get('/manager/simulations', auth.authenticate(), function (req, res) {
    var Simulation = app.db.model('Simulation')

    Simulation.find({}, function (err, simulations) {
      if (err) { res.send(err) }

      res.json(simulations)
    })
  })

  app.get('/manager/simulations/:date', auth.authenticate(), function (req, res) {
    var date = timestamp.toDate(req.params.date)

    var Simulation = app.db.model('Simulation')

    Simulation.find({ synched: { $gt: date } }, function (err, simulations) {
      if (err) { res.send(err) }

      res.json(simulations)
    })
  })
}
