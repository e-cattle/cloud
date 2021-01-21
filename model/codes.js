module.exports = function (app) {
  var Schema = app.db.Schema
  return app.db.model('Codes', new Schema({
    currentCodeFarm: { type: Number, unique: true, default: 0 }
  })
  )
}
