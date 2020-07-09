
var passport = require('passport')

var jwt = require('passport-jwt')

var Strategy = jwt.Strategy

module.exports = function (app) {
  var params = {
    secretOrKey: app.settings.security.secret,
    jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderAsBearerToken()
  }

  var strategy = new Strategy(params, function (payload, done) {
    switch (payload.type) {
    case 'USER':
      var User = app.db.model('User')

      User.findOne({ email: payload.email }, function (error, user) {
        if (error || !user) { return done(new Error('User not found!'), null) }

        return done(null, user)
      })

      break

    case 'GATEWAY':
      /*
      var Gateway = app.db.model('Gateway')

      Gateway.findOne({ gateway: payload.email, farm: payload.email }, function (error, gateway) {
        if (error || !gateway) { return done(new Error('Gateway not found!'), null) }

        return done(null, gateway)
      })
      */
      return done(null, {})

      // break
    }
  })

  passport.use(strategy)

  return {
    initialize: function () {
      return passport.initialize()
    },
    authenticate: function () {
      return passport.authenticate('jwt', { session: false })
    }
  }
}
