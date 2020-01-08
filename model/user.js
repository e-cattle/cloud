module.exports = function (app) {
  var Schema = app.db.Schema

  var UserSchema = new Schema({
    name: String,
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    picture: String,
    created: { type: Date, default: Date.now },
    changed: { type: Date, default: Date.now },
    admin: { type: Boolean, default: false }
  })

  return app.db.model('User', UserSchema)
}
