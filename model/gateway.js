module.exports = function (app) {
  var Schema = app.db.Schema

  var gateway = new Schema({
    description: {
      type: String,
      required: true
    },
    mac: {
      type: String,
      required: true
    },
    created: { type: Date, default: Date.now },
    changed: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    farm: { type: Schema.Types.ObjectId, ref: 'Farm' },
    author: { type: Schema.Types.ObjectId, ref: 'User' }
  }, { strict: false })

  gateway.index({ farm: 1, mac: 1 }, { unique: true })

  return app.db.model('Gateway', gateway)
}
