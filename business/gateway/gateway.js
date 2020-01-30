
module.exports = function (app) {
  var jwt = require('jwt-simple')

  var auth = require('../../auth/user.js')(app)

  app.get('/gateway/token/:farm', function (req, res) {
    /*
     * Procurar pela fazenda (utilizando o CODE passado - :farm) e registrar um novo 'candidato a gateway'.
     * Criar uma nova collection no Mongoose denominada 'candidate'. Inserir o MAC (que veio do BigBoxx) e data de registro.
     * Haverá um CRUD específico para 'candidatos', onde o usuário da propriedade poderá aprovar, salvando o novo BigBoxx em uma collection
     * denominada 'gateway' (e apagando da candidate). Neste momento é obrigatória uma descrição e são armazanados o usuário que aprovou e
     * todos os dados possíveis (MAC, dada do pedido, data da aprovação, etc). Um MAC já cadastrado na propriedade é simplesmente 'ativado'
     * no momento de sua aprovação. Por fim, é retornado o JWT conforme mockup abaixo.
     */

    return res.json({
      token: jwt.encode({
        farm: req.params.farm,
        mac: req.body.mac,
        date: Date.now
      }, process.env.SECRET)
    })
  })

  app.get('/gateway/active', auth.authenticate(), function (req, res) {
    /*
     * Obtem o MAC e o CODE da fazenda do payload do JWT e retorna se o gateway está ativo, ou seja,
     * se já foi 'aprovado' (saiu das collection 'candidate' para a 'gateway') e está com o bit de 'active'
     * setado para 1.
     */

    return res.json({ active: true })
  })

  app.get('/gateway/farm', auth.authenticate(), function (req, res) {
    /*
     * Obtem dados básicos da fazenda a partir do CODE presente no payload do JWT.
     */

    return res.json({
      name: 'Santa Clara',
      city: 'Campo Grande - MS',
      farmer: 'Camilo Carromeu',
      since: '12/8/18'
    })
  })
}
