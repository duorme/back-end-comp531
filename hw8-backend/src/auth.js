const md5 = require('md5')
const request = require('request')
const qs = require('querystring')
const session = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const cookieParser=require('cookie-parser')
const isLoggedIn = require('./middleware.js').isLoggedIn
// login
const redis = require('redis').createClient("redis://h:pfe02f6bf53b86af67751ca5f35cf44707b4e8d7fedb1c12ecc127509755e24a4@ec2-34-206-56-163.compute-1.amazonaws.com:27519")
//fb 
const config={   
        'clientID'      : '698663930324108', // your App ID
        'clientSecret'  : 'e9077b895e893db068594694890eafc4', // your App Secret
        'callbackURL'   : 'https://nameless-peak-71326.herokuapp.com/auth/facebook/callback',
        enableProof: true
    }

    var front_end_url=''


    const User = require('./model.js').User
    const Profile = require('./model.js').Profile
    const cookieKey='sid'
    const users={}


// for facebook oauth
passport.serializeUser(function(user,done){
	done(null,user.id)
	
	
})
passport.deserializeUser(function(id,done){
	// const user = users[id]
	User.find({authId:id}).exec(function(err, user){
		if(err || user.length == 0) console.log(err)
			else{
				console.log('user',user[0])
				return done(null,user[0])
			}
		})
})
passport.use(new FacebookStrategy(config,
	function(token,refreshToken,profile,done){
		process.nextTick(function(){
			const username = profile.displayName+"@"+profile.provider
			const id = profile.id
			User.find({username:username}).exec(function(err,users){
				if(!users || users.length == 0){
					const auth=[]
					const obj = {}
					obj[profile.provider]=profile.displayName
					auth.push(obj)
					new User({username:username,authId:id,hash:'',salt:'',auth:auth}).save(function(err,user){
						if(err) console.log(err)
					})
					new Profile({username:username,headline:'hello',following:['sep1','jmp3','tz13','zy13test'],dob:'',email:'',zipcode:'',avatar:'http://cistercianinformer.com/wp-content/uploads/2016/01/rice-logo.png'})
					.save(function(err,user){
						if(err){
							return console.log(err)
						}

					})
					done(null,profile)
				}
				else{
					done(null,profile)
				}

			})
		})
	}))


const logout_default=(req,res)=>{
	if (req.isAuthenticated()) {
		req.session.destroy()
		req.logout()
		res.clearCookie(cookieKey)
		return res.sendStatus(200)
	} 
	else{
	//clear log in information
	//clear session id
	redis.del(req.cookies[cookieKey])
	res.clearCookie(cookieKey)
	return res.sendStatus(200)	
}
	
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
	front_end_url = req.get('Referrer')
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
		const newUser ={username:userObj.username}
		redis.hmset(sid, newUser)
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


const referrer=(req,res,next)=>{
	front_end_url = req.get('Referrer')
	next()
}

const linkAccount=(req,res)=>{

	const authName = req.username.split('@')
	var username = req.body.username
	var password = req.body.password
	if(!username || !password){
		res.sendStatus(400)
		return
	}
	// find user
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

		//Link find 
		const newAuthentication={}
		newAuthentication[authName[1]]=authName[0]
		User.update({username:username},{$push:{auth:newAuthentication}}, {new: true},function(err,users){
			if(err){
				return console.log(err)
			}
			else{
				User.find({username:req.username}).remove().exec(function(err,profile){
					if(err) console.log(err)
				})
				Profile.find({username:req.username}).remove().exec(function(err,users){
					if(err) console.log(err)
					if(users.length == 0){
						return res.sendStatus(401)
					}
					else{
						console.log("remove profile successfully")
					}
				})

			}
		})
	return res.sendStatus(200)
	})

}

const facebookCallback=(req,res)=>{
   
    res.redirect(front_end_url)
	

}
const facebook_unlink=(req,res)=>{
	const username = req.username
	User.findOne({username: username}).exec(function(err, user){
		if(user.auth.length !== 0){
			const newAuth = user.auth.filter((obj)=>{return obj['facebook'] == null})
			User.update({username: username}, {$set: {auth: newAuth}}, {new: true}, function(){
				return res.sendStatus(200)
			})
		} else {
			return res.send({"message":"no linkAccount"})
		}
	})
}
const fail = (req, res) => {
    res.send('This authentication token has been used, please refresh the page')
}

module.exports = app =>{
	app.use(cookieParser())
	app.use(session({secret:'thisisSecretMessage'}))
	app.use(passport.initialize())
	app.use(passport.session())
	app.use('/auth/facebook',passport.authenticate('facebook',{scope:'email'}))
	app.use('/auth/facebook/callback',passport.authenticate('facebook',
		{failureRedirect:'/fail',successRedirect:'https://piquant-ice.surge.sh'}))


	app.post('/register',userRegister)
	app.post('/login',userlogin)
	app.get('/fail',fail)
	app.put('/logout',isLoggedIn,logout_default)
	app.put('/password',isLoggedIn,putPassword)
	app.post('/linkAccount',isLoggedIn,linkAccount)
	app.post('/unlinkFB',isLoggedIn,facebook_unlink)


}
