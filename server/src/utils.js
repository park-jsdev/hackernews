const jwt = require('jsonwebtoken')
const APP_SECRET = 'GraphQL-is-aw3some'

function getUserId(context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, APP_SECRET)
    return userId
  }

  throw new Error('Not authenticated')
}

// The APP_SECRET is used to sign the JWTs which you’re issuing for your users.
// The getUserId function is a helper function that you’ll call in resolvers which require authentication
//  (such as post). It first retrieves the Authorization header (which contains the User’s JWT) from the context.
//   It then verifies the JWT and retrieves the User’s ID from it. Notice that if that process is not successful 
//   for any reason, the function will throw an exception. You can therefore use it to “protect” the resolvers which require authentication.
module.exports = {
  APP_SECRET,
  getUserId,
}