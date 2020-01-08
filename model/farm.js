
var uuid = require('uuid/v1')

module.exports = function (app) {
  var Schema = app.db.Schema

  return app.db.model('Farm', new Schema({
    code: { type: String, required: true, unique: true, default: uuid },
    name: String,
    city: String,
    state: String,
    created: { type: Date, default: Date.now },
    changed: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' }
  }, { strict: false }))
}
