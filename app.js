
var consign = require('consign')()

var app = require('express')()

var parser = require('body-parser')

require('dotenv').config()

var cors = require('cors')

app.use(cors())

var environment = process.argv[2] != null ? process.argv[2] : 'production'

console.log('Environment: \'' + environment + '\'')

app.use(parser.urlencoded({ extended: true }))

app.use(parser.json())

var mongoose = require('mongoose')

mongoose.set('useCreateIndex', true)

const db = 'database'

console.log('MongoDB URI: ' + db)

const connect = () => {
  mongoose.connect('mongodb://' + db).then(() => {
    console.log('Mongo is connected!')
  }).catch(error => {
    console.error('Critical error to connect on DB: "mongodb://' + db + '"')
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

const port = '3000'
const ip = '0.0.0.0'

console.log('Listening: ' + ip + ':' + port)

app.listen(port, ip, function () {
  console.log('Server running at port ' + port + '!')
})
