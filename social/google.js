
var jwt = require('jwt-simple')
var Request = require('request')

module.exports = function (app) {
  return {
    login (req, res) {
      console.log('Call https://accounts.google.com/o/oauth2/token')

      Request({
        method: 'post',
        url: 'https://accounts.google.com/o/oauth2/token',
        form: {
          code: req.body.code,
          client_id: process.env.GOOGLE_ID,
          client_secret: process.env.GOOGLE_PK,
          redirect_uri: req.body.redirectUri,
          grant_type: 'authorization_code'
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      }, function (err, response, body) {
        try {
          if (err || response.statusCode !== 200) {
            res.status(response.statusCode).json(err)
          }

          console.log('Call https://www.googleapis.com/plus/v1/people/me?access_token')

          Request({
            method: 'get',
            url: 'https://www.googleapis.com/plus/v1/people/me?access_token=' + JSON.parse(body).access_token
          }, function (err, response, body) {
            try {
              if (err || response.statusCode !== 200) {
                res.status(response.statusCode).json(err)
              }

              var data = JSON.parse(body)

              console.log(JSON.stringify(data))

              var User = app.db.model('User')

              console.log('Tentando encontrar o usuário com e-mail: ' + data.emails[0].value)

              User.findOne({ email: data.emails[0].value }, function (error, result) {
                if (error) {
                  console.log('Problema na busca!')
                  return res.status(500).json(error)
                }

                if (!result) {
                  console.log('Não encontrou o usuário... vai tentar criar!')

                  var user = new User()

                  user.name = data.displayName
                  user.email = data.emails[0].value
                  user.picture = data.image.url.replace('?sz=50', '?sz=512')
                  user.admin = false
                  user.save(function (error) {
                    if (error) {
                      console.log('Problema pra criar o usuário!')
                      return res.status(500).json(error)
                    }

                    console.log('Criou o usuário... retornando!')

                    return res.json({ token: jwt.encode({ email: data.emails[0].value, date: Date.now }, process.env.SECRET) })
                  })
                } else {
                  console.log('Achou o usuário... retornando!')
                  return res.json({ token: jwt.encode({ email: data.emails[0].value, date: Date.now }, process.env.SECRET) })
                }
              })
            } catch (e) {
              res.status(500).json(err || e)
            }
          })
        } catch (e) {
          res.status(500).json(err || e)
        }
      })
    }
  }
}
