module.exports = function (app) {
  var Schema = app.db.Schema

  var NewUserSchema = new Schema({
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    role: String,
    farm: { type: Schema.Types.ObjectId, ref: 'Farm' },
    created: { type: Date, default: Date.now }
  })

  return app.db.model('NewUser', NewUserSchema)
}
