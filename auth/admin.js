
module.exports = function () {
  return function (req, res, next) {
    console.log('Ok: ' + req.user.name)
    if (!req.user.admin) {
      res.status(403).json({ message: 'You\'re not admin!' })
    } else {
      next()
    }
  }
}
