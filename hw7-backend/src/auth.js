const md5 = require('md5')
const request = require('request')
const qs = require('querystring')
const session = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const cookieParser=require('cookie-parser')
const isLoggedIn = require('./middleware.js').isLoggedIn

const redis = require('redis').createClient("redis://h:pfe02f6bf53b86af67751ca5f35cf44707b4e8d7fedb1c12ecc127509755e24a4@ec2-34-206-56-163.compute-1.amazonaws.com:27519")

const config={   
        'clientID'      : '698663930324108', // your App ID
        'clientSecret'  : 'e9077b895e893db068594694890eafc4', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
}

const User = require('./model.js').User
const Profile = require('./model.js').Profile
const cookieKey='sid'
const users={}
// for facebook oauth
passport.serializeUser(function(user,done){
	users[user.id]=user
	done(null,user.id)
})
passport.deserializeUser(function(id,done){
	const user = users[id]
	done(null,user)
})
passport.use(new FacebookStrategy(config,
	function(token,refreshToken,profile,done){
		process.nextTick(function(){
		const newUser={username:profile.name,
		id:profile.id
	}
		users[newUser.id]=newUser
			return done(null,profile)
		})
	}))


// for log out
const logout=(req,res)=>{
	req.logout();
	res.redirect('/')
}
const logout_default=(req,res)=>{
	// delete session key for redis
	redis.del(req.cookies[cookieKey])
	res.clearCookie(cookieKey)
	res.sendStatus(200)
}


const isOathLoggedIn=(req,res,next)=>{
	if(req.isAuthenticated()){
		next()
	}else{
		res.redirect('/login')
	}
}
function profile(req,res){
	res.send('ok now what?',req.user)
}
// for register
const userRegister=(req,res)=>{
	var username = req.body.username
	var password = req.body.password
	var email=req.body.email
	var dob=req.body.dob
	var zipcode=req.body.zipcode
	if(!username || !password||!email||!dob||!zipcode){
		res.sendStatus(400)
		return
	}
	User.find({username:username}).exec(function(err,users){
		if(err){
			console.log(err)
			return 
		}
		else{
			if(users.length != 0){
				res.status(400).send('user has been registered')
				return 
			}
			new Profile({username:username,headline:'hello',following:['sep1','jmp3','tz13','zy13test'],dob:dob,email:email,zipcode:zipcode,avatar:'http://cistercianinformer.com/wp-content/uploads/2016/01/rice-logo.png'})
			.save(function(err,profile){
					if(err){
						return console.log(err)
					}				
			})
			const salt = createSalt(username)
			const hash = md5(salt + password)
			new User({username:username,salt:salt,hash:hash}).save(function(err,user){
				if(err){
					return console.log(err)
				}
			})
			var msg = { username: username, result: 'success' }
			res.send(msg)
	}
	
})
}

//generate sid
const generateCode=(userObj)=>{
	return md5(userObj.username+userObj.hash)
}
//generate salt for user
const createSalt=(username)=>{
	return new Date()+username
}

const userlogin=(req,res)=>{
	var username = req.body.username
	var password = req.body.password
	if(!username || !password){
		res.sendStatus(400)
		return
	}
	User.find({ username: username }).exec(function(err, users) {
	    if (err) {
	        return console.log(err)
	    }
	    if (!users || users.length == 0) {
	        res.sendStatus(401)
	        return
	    }
	    const userObj = users[0]
	    const passSalted = md5(userObj.salt + password)
	    if (passSalted !== userObj.hash) {
	        res.sendStatus(401)
	        return
	    }
	    const sid = generateCode(userObj)
	    redis.hmset(sid, userObj)
	    res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true })
	    var msg = { username: username, result: 'success' }
	    res.send(msg)

	})	
	
}
const putPassword=(req,res)=>{
	var password=req.body.password
	const username = req.username
	if(!password){
		res.sendStatus(400)
	}
	User.find({username:username}).exec(function(err,users){
		if(err){
			return console.log(err)
		}
		if(users.length== 0){
			res.sendStatus(401)
			return
		}
		var user=users[0]
		const newsalt = createSalt(username)
		const passSalted = md5(newsalt + password)
		User.update({username:username}, { salt:newsalt,hash:passSalted}, {new:true},function(err,profile){
			if(err) return console.log(err)
			res.send({username:username,message:"success"})
		})
	})
	
}
const fail=(req,res)=>{
	res.send({status:'can not log in'})
}
module.exports = app =>{
	app.post('/register',userRegister)
	app.post('/login',userlogin)
	app.put('/logout',isLoggedIn,logout_default)
	app.put('/password',isLoggedIn,putPassword)
	app.use(session({secret:'thisisSecretMessage'}))
	app.use(passport.initialize())
	app.use(passport.session())
	app.use(cookieParser())
	app.use('/auth/facebook',passport.authenticate('facebook',{scope:'email'}))
	app.use('/auth/facebook/callback',passport.authenticate('facebook',
		{successRedirect:'/profile',failureRedirect:'/fail'}))
	app.use('/profile',isOathLoggedIn,profile)
	// app.use('/logout',logout)

}
