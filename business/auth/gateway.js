
const jwt = require('jwt-simple')

exports.authenticateGateway = async function (req, res, next) {
   token = req.headers.authorization
   const { code } = req.query;
  if (!token) {
   return res.status(401).json({
      message: 'Invalid (or empty) token!'
    })
  }

  token = token.replace('Bearer ', '')
  await jwt.decode(token, `${process.env.JWT_SECRET}${code}`, function (error, decoded) {
    if (error) {
       return res.status(401).json({
        message: 'Invalid token!'
      })

     
    }

    req.code = decoded.code

    next()
  })
}