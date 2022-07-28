module.exports = function (app) {
  var Schema = app.db.Schema

  return app.db.model('Pin', new Schema({
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    pin: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{6}$/,
      minLength: 6,
      maxLength: 6
    },
    date: { type: Date, default: Date.now }
  }))
}
