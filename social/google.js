
var jwt = require('jwt-simple')

var Request = require('request')

module.exports = function (app) {
  return {
    login (req, res) {
      Request({
        method: 'post',
        url: 'https://accounts.google.com/o/oauth2/token',
        form: {
          code: req.body.code,
          client_id: app.settings.auth.google.id,
          client_secret: app.settings.auth.google.secret,
          redirect_uri: req.body.redirectUri,
          grant_type: 'authorization_code'
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      }, function (err, response, body) {
        try {
          if (err || response.statusCode !== 200) {
            return res.status(response.statusCode).json(err)
          }

          Request({
            method: 'get',
            url: 'https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + JSON.parse(body).access_token
          }, function (err, response, body) {
            try {
              if (err || response.statusCode !== 200) {
                return res.status(response.statusCode).json(err)
              }

              var data = JSON.parse(body)

              var User = app.db.model('User')

              User.findOne({ email: data.email }, function (error, result) {
                if (error) {
                  return res.status(500).json(error)
                }

                if (!result) {
                  var user = new User()

                  user.name = data.name
                  user.email = data.email
                  user.picture = data.picture
                  user.admin = false
                  user.save(function (error) {
                    if (error) {
                      return res.status(500).json(error)
                    }

                    return res.status(200).json({ token: jwt.encode({ type: 'USER', email: data.email, date: Date.now }, app.settings.security.secret) })
                  })
                } else {
                  return res.status(200).json({ token: jwt.encode({ type: 'USER', email: data.email, date: Date.now }, app.settings.security.secret) })
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
