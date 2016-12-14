// main file to define the API endpoints and their handler chains

'use strict'

const restify = require('restify')
const server = restify.createServer()

const product = require('./routes/product')
const id = require('./routes/order')
const authorization = require('./routes/user')
const login = require('./routes/users/')

server.use(restify.fullResponse())
server.use(restify.queryParser())
server.use(restify.bodyParser())
server.use(restify.authorizationParser())

server.get('/booksearch', googleapi.doBookSearch)

server.get('/user', authorization.authorize, product.list)  // get a list of all favs
server.post('/user', authorization.authorize, order.validate, favourites.add)  // add a new fav
server.get('/user/:id', authorization.authorize, product.get)  // get details of a particular fav using id
server.put('/user/:login', authorization.authorize, user.validate, favourites.update)  // update details of existing fav using id
server.del('/user/:delete', authorization.authorize, user.delete)  // delete existing fav using id

server.post('/users', users.validateUser, users.add)  // add a new user to the DB (pending confirmation)
server.post('/users/confirm/:username', users.validateCode, users.confirm)  // confirm a pending user
server.del('/users/:username', authorization.authorize, users.delete)  // delete a user

const port = process.env.PORT || 8080

server.listen(port, err => console.log(err || `App running on port ${port}`))
