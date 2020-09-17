module.exports = function (app) {
  var Schema = app.db.Schema

  return app.db.model('Farm', new Schema({
    code: { type: Number, required: true, unique: true },
    name: String,
    city: String,
    state: String,
    address: String,
    subscription: String,
    created: { type: Date, default: Date.now },
    changed: { type: Date, default: Date.now },
    synched: { type: Date },
    active: { type: Boolean, default: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    users: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, role: String }]
  }).index({ code: 1 })
  )
}
