
module.exports = function (app) {
  var jwt = require('jwt-simple')

  var auth = require('../../auth.js')(app)

  app.post('/gateway/register', (req, res) => {
    /*
     * Procurar pela fazenda (utilizando o CODE passado - :farm) e registrar um novo 'candidato a gateway'.
     * Criar uma nova collection no Mongoose denominada 'gateway', com os seguintes atributos:
     * farm: chave estrangeira para esta collection
     * mac: MAC Address
     * description: inicalmente null (poderá ser alterado apenas pela interface web)
     * author: chave estrangeira para 'user' e pode ser null inicialmente. sempre atualizado para o último author que fez qualquer ação.
     * register: true quando o gateway é registrado e false quando é feito o unregister remoto (não pode ser alterado pela interface web)
     * registered: data do registro
     * approve: false no registro e true quando é aceito pela interface web
     * approved: null inicialmente e data da aprovação depois
     * approver: null inicialmente e usuário que aprovou depois (chave estrangeira para 'user')
     * active: false no registro e true automático quando é aprovado (pode ser mudado a qualquer momento pela interface web)
     * Pela interface web é possível apagar permanentemente um gateway (é preciso 'logar' isso).
     * Caso o dispositivo esteja com register=false, ele é simplesmente alterado para true nesta chamada.
     * Por fim, é retornado o JWT conforme mockup abaixo.
     */

    if (!req.body.mac) {
      return res.status(500).json('Invalid MAC address!')
    }

    return res.json({
      token: jwt.encode({
        type: 'GATEWAY',
        farm: req.body.farm,
        mac: req.body.mac,
        date: Date.now
      }, process.env.JWT_SECRET)
    })
  })

  app.post('/gateway/unregister', auth.authenticate(), (req, res) => {
    return res.json({})
  })

  // app.get('/gateway/active', auth.authenticate(), function (req, res) {
  app.get('/gateway/status', auth.authenticate(), function (req, res) {
    /*
     * Obtem o MAC e o CODE da fazenda do payload do JWT e retorna se o gateway está ativo, ou seja,
     * se já foi 'aprovado' e está com o bit de 'active'
     * setado para 1.
     */

    return res.json({
      register: true,
      approve: true,
      active: true
    })
  })

  app.get('/gateway/farm/synopsis', auth.authenticate(), (req, res) => {
    /*
     * Obtem dados básicos da fazenda a partir do CODE presente no payload do JWT.
     */

    return res.json({
      name: 'Santa Clara',
      location: 'Campo Grande - MS',
      country: 'Brasil'
    })
  })
}
