
var axios = require('axios')

module.exports = function (app) {
  return {
    login (req, res) {
      axios.post('https://graph.facebook.com/v2.4/oauth/access_token', {
        client_id: process.env.FACEBOOK_ID,
        client_secret: process.env.FACEBOOK_PK,
        code: req.body.code,
        redirect_uri: req.body.redirectUri
      }, { 'Content-Type': 'application/json' }).then(function (response) {
        axios.post('https://graph.facebook.com/v2.5/me', {
          access_token: response.data.access_token,
          fields: ['id', 'name', 'picture', 'email']
        }, { 'Content-Type': 'application/json' }).then(function (response) {
          return {
            name: response.data.name,
            email: response.data.email,
            picture: 'https://graph.facebook.com/' + response.data.id + '/picture?type=large'
          }
        }).then(function (data) {
          var User = app.db.model('User')

          User.findOne({ email: data.email }, function (error, result) {
            if (error) { return res.status(500).json(error) }

            if (!result) {
              var user = new User()

              user.name = data.name
              user.email = data.email
              user.picture = data.picture
              user.admin = false
              user.save(function (error) {
                if (error) { return res.status(500).json(error) }

                return data.email
              })
            } else {
              return data.email
            }
          })
        }).catch(function (err) {
          res.status(500).json(err)
        })
      }).catch(function (err) {
        res.status(500).json(err)
      })
    }
  }
}
