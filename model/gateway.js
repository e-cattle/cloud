module.exports = function (app) {
  var Schema = app.db.Schema

  var gateway = new Schema({
    description: { type: String }, // description: inicialmente null (poderá ser alterado apenas pela interface web)
    mac: { type: String, required: true },
    created: { type: Date, default: Date.now },
    changed: { type: Date, default: Date.now },
    active: { type: Boolean, default: false }, // active: false no registro e true automático quando é aprovado (pode ser mudado a qualquer momento pela interface web)
    register: { type: Boolean, default: true }, // register: true quando o gateway é registrado e false quando é feito o unregister remoto (não pode ser alterado pela interface web)
    registered: { type: Date, default: Date.now }, // registered: data do registro
    approve: { type: Boolean, default: false }, // approve: false no registro e true quando é aceito pela interface web
    approved: { type: Date }, // approved: null inicialmente e data da aprovação depois
    approver: { type: Schema.Types.ObjectId, ref: 'User' }, // approver: null inicialmente e usuário que aprovou depois (chave estrangeira para 'user')
    farm: { type: Schema.Types.ObjectId, ref: 'Farm' },
    author: { type: Schema.Types.ObjectId, ref: 'User' } // author: chave estrangeira para 'user' e pode ser null inicialmente. sempre atualizado para o último author que fez qualquer ação.
  }, { strict: false })

  gateway.index({ farm: 1, mac: 1 }, { unique: true })

  return app.db.model('Gateway', gateway)
}
