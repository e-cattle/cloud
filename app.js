
var consign = require('consign')()

var app = require('express')()

var parser = require('body-parser')

var cors = require('cors')

require('dotenv').config()

console.log(JSON.stringify(process.env.DB))

app.use(cors())

var environment = process.argv[2] != null ? process.argv[2] : 'production'

console.log('Loading settings to environment \'' + environment + '\'')

app.use(parser.urlencoded({ extended: true }))

app.use(parser.json())

var mongoose = require('mongoose')

console.log('MongoDB URI: ' + process.env.DB)

const connect = () => {
  mongoose.connect('mongodb://' + process.env.DB).then(() => {
    console.log('Mongo is connected!')
  }).catch(error => {
    console.error('Critical error to connect on DB: "mongodb://' + process.env.DB + '"')
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

var port = process.env.PORT
var ip = process.env.IP || '0.0.0.0'

console.log('Listening: ' + ip + ':' + port)

app.listen(port, ip, function () {
  console.log('Server running at port ' + port + '!')
})
