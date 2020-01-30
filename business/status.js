
module.exports = function (app) {
  app.get('/status', function (req, res) {
    res.status(200).json('Ok')
  })

  app.get('/', function (req, res) {
    var pkg = require('../package.json')

    res.status(200).json({ name: pkg.name, description: pkg.description, version: pkg.version })
  })
}
