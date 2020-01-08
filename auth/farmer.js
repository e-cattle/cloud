
var passport = require('passport')

var jwt = require('passport-jwt')

var Strategy = jwt.Strategy

module.exports = function (app) {
  var params = {
    secretOrKey: process.env.SECRET_WEB,
    jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderAsBearerToken()
  }

  var strategy = new Strategy(params, function (payload, done) {
    var User = app.db.model('User')

    User.findOne({ email: payload.email }, function (error, user) {
      if (error || !user) { return done(new Error('User not found!'), null) }

      return done(null, user)
    })
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
