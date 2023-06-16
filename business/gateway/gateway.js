
module.exports = function (app) {
  var jwt = require('jwt-simple')

  var auth = require('../auth/gateway.js')

  app.post('/gateway/register', (req, res) => {
    /*
     * Procurar pela fazenda (utilizando o CODE passado - :farm) e registrar um novo 'candidato a gateway'.
     * Criar uma nova collection no Mongoose denominada 'gateway', com os seguintes atributos:
     * farm: chave estrangeira para esta collection - OK
     * mac: MAC Address - OK
     * description: inicalmente null (poderá ser alterado apenas pela interface web) - OK
     * author: chave estrangeira para 'user' e pode ser null inicialmente. sempre atualizado para o último author que fez qualquer ação. - OK
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

    var code = req.body.farm
    var Farm = app.db.model('Farm')
    var Gateway = app.db.model('Gateway')

    Farm.findOne({ code: code }).populate('users.user').exec(function (err, farm) {
      if (err || !farm) {
        return res.status(500).json('Code de propriedade inválido')
      } else {
        Gateway.findOneAndUpdate({ mac: req.body.mac }, { mac: req.body.mac, farm: farm }, { upsert: true, setDefaultsOnInsert: true }, function (error) {
          if (error) { return res.status(500).json('Erro ao salvar Gateway') }
          return res.json({
            token: jwt.encode({
              type: 'GATEWAY',
              farm: req.body.farm,
              mac: req.body.mac,
              date: Date.now
            }, `${req.body.mac}${code}`)
          })
        })
      }
    })
  })

  app.post('/gateway/unregister', async (req, res) => {
    auth.authenticateGateway(req, res);
    const { code, mac } = req.body;
    //const payloadDecoded = jwt.decode(req.headers.authorization.replace('Bearer ', ''), `${mac}${code}`)
    var Gateway = app.db.model('Gateway')
    var resetGateway = {
      active: false,
      approve: false,
      register: false,
      registered: null,
      approver: null,
      farm: null
    }
    await Gateway.findOneAndUpdate({ mac: mac }, resetGateway, function (error) {
      if (error) { return res.status(500).send(error) } else { return res.status(200).json('Gateway de MAC ' + mac + ' desvinculado!') }
    })

    await Gateway.syncIndexes()
  })

  app.get('/gateway/status', async function (req, res) {
    /*
     * Obtem o MAC e o CODE da fazenda do payload do JWT e retorna se o gateway está ativo, ou seja,
     * se já foi 'aprovado' e está com o bit de 'active'
     * setado para 1.
     */
    auth.authenticateGateway(req, res);
    const { code, mac } = req.query;
    // const payloadDecoded = jwt.decode(req.headers.authorization.replace('Bearer ', ''), `${mac}${code}`)

    var Gateway = app.db.model('Gateway')
    await Gateway.findOne({ mac }).populate('farm').populate('author').exec(function (err, gateway) {
      if (err || gateway === null) {
        return res.json({
          register: false,
          approve: false,
          active: false
        })
      } else {
        return res.json({
          register: gateway.register,
          approve: gateway.approve,
          active: gateway.active
        })
      }
    })
  })

  app.get('/gateway/farm/synopsis', async (req, res) => {
    /*
     * Obtem dados básicos da fazenda a partir do CODE presente no payload do JWT.
     */
    auth.authenticateGateway(req, res);
    const { code } = req.query;
    //const payloadDecoded = jwt.decode(req.headers.authorization.replace('Bearer ', ''), `${mac}${code}`)
    var Farm = app.db.model('Farm')
    await Farm.findOne({ code: code }).populate('users').exec(function (err, farm) {
      if (err || !farm) {
        return res.status(500).json(err)
      } else {
        return res.json({
          name: farm.name,
          location: farm.city + ' - ' + farm.state,
          country: 'Brasil'
        })
      }
    })
  })
}
