
var consign = require('consign')()

var app = require('express')()

var parser = require('body-parser')

var cors = require('cors')

app.use(cors())

var environment = process.argv[2] != null ? process.argv[2] : 'production'

console.log('Loading settings to environment \'' + environment + '\'')

app.settings = require('./settings/' + environment + '.json')

app.use(parser.urlencoded({ extended: true }))

app.use(parser.json())

var mongoose = require('mongoose')

console.log('MongoDB URI: ' + app.settings.database.uri)

const connect = () => {
  mongoose.connect('mongodb://' + app.settings.database.uri).then(() => {
    console.log('Mongo is connected!')
  }).catch(error => {
    console.error('Critical error to connect on DB: "mongodb://' + app.settings.database.uri + '"')
    console.error(error)

    setTimeout(connect, 5000)
  })
}

connect()

mongoose.connection.on('error', console.error.bind(console, 'Connection error:'))

mongoose.connection.once('open', function () {
  console.log('DB connection alive!')
})

app.db = mongoose

consign
  .include('business')
  .then('model')
  .into(app)

var port = app.settings.api.port
var ip = process.env.IP || '0.0.0.0'

console.log('Listening: ' + ip + ':' + port)

app.listen(port, ip, function () {
  console.log('Server running at port ' + port + '!')
})
