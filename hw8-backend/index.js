const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const cookieParser=require('cookie-parser')

const request = require('request')
const qs = require('querystring')
const session = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;


if (process.env.NODE_ENV !== "production") {
    require('dotenv').load()
}
const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin',req.headers.origin)
    res.header('Access-Control-Allow-Credentials',true)
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers','Authorization, Content-Type')
    if(req.method=='OPTIONS'){
    	res.sendStatus(200)
    	return
    }
    next()
}
const app = express()

app.use(logger('default'))
// app.use(cookieParser())
app.use(bodyParser.json())
// app.use(session({secret:'thisisSecretMessage'}))
// app.use(passport.initialize())
// app.use(passport.session())
app.use(corsMiddleware)




require('./src/auth.js')(app)
require('./src/articles.js')(app)
require('./src/profile.js')(app)

require('./src/following.js')(app)

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})


