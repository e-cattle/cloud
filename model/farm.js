const { autoIncrement } = require('mongoose-plugin-autoinc')

module.exports = function (app) {
  var Schema = app.db.Schema
  var FarmSchema = new Schema({
    name: String,
    city: String,
    state: String,
    address: String,
    subscription: String,
    created: { type: Date, default: Date.now },
    changed: { type: Date, default: Date.now },
    synched: { type: Date },
    active: { type: Boolean, default: true },
    stackSwarmCreated: { type: Boolean, default: false },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    users: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, role: String }]
  }).plugin(autoIncrement, {
    model: 'farms',
    field: 'code',
    startAt: 1
  })

  return app.db.model('Farm', FarmSchema)
}
