// this is profile.js which contains all user profile 
// information except passwords which is in auth.js
const Profile = require('./model.js').Profile
const isLoggedIn = require('./middleware.js').isLoggedIn

const index = (req, res) => {
	res.send({hello: 'world'})
}
const getHeadlines = (req, res) => {
	const users = req.params.users ? req.params.users.split(',') : [req.username]
	var headlines=[]
	Profile.find({username:{$in : users}}).exec(function(err,profiles){
		if(err) return console.log(err)
		if(!profiles || profiles.length == 0){
			res.sendStatus(400)
			return 
		}
		profiles.forEach((profile)=>{
			headlines.push({username:profile.username,headline:profile.headline})
		})
		res.send({headlines:headlines})
	})
			
		

}

const putHeadline = (req, res) => {
	if(!req.body.headline){
		res.sendStatus(400)
		return
	}
	const username = req.username
	Profile.find({username:username}).exec(function(err,users){
		if(err){
			return console.log(err)
		}
		if(users.length== 0){
			res.sendStatus(401)
			return
		}
		var user=users[0]
		Profile.update({username:username}, {$set:{headline:req.body.headline}}, {new: true}, function(err,profile){
			if(err) {return console.log(err)}
			Profile.find({username:username}).exec(function(err,profiles){
				if(err) return console.log(err)
				else{
					return res.send({username:username,headline:profiles[0].headline})
				}
			})		
	})
	
})	
}

const getEmail = (req, res) => {
	const username=req.params.user?req.params.user:req.username
	Profile.find({username:username}).exec(function(err,items){
			res.send({username:username, email:items[0].email})
		})		
}

const putEmail = (req, res) => {
	const email=req.body.email
	if(!email){
		res.sendStatus(401)
		return
	}
	Profile.find({username:username}).exec(function(err,users){
		if(err){
			return console.log(err)
		}
		if(users.length== 0){
			res.sendStatus(401)
			return
		}
		var user=users[0]
		Profile.update({username:username}, {$set:{email:req.body.email}}, {new: true}, function(err,profile){
			if(err){
				res.sendStatus(400)
				return console.log(err)
			}
			else{
				Profile.find({username:username}).exec(function(err,profiles){
				if(err) return console.log(err)
				else{
					return res.send({username:username,email:profiles[0].email})
				}
			})	
			}
		})
	})
	
}

const getZipcode = (req, res) => {
	username=req.params.user?req.params.user:req.username
	
	Profile.find({username:username}).exec(function(err,items){
			const zipcode = items[0].zipcode
			res.send({username:username, zipcode:zipcode})
		})	
}

const putZipcode = (req, res) => {
	const zipcode=req.body.zipcode
	if(!zipcode){
		res.sendStatus(401)
		return
	}
	Profile.update({username:username}, {$set:{zipcode:zipcode}}, {new: true}, function(err,profile){
			if(err){
				return console.log(err)
			}
			else{
				Profile.find({username:username}).exec(function(err,profiles){
				if(err) return console.log(err)
				else{
					return res.send({username:username,zipcode:profiles[0].zipcode})
				}
			})	
			}
		})
}

const getAvatars = (req, res) => {
	const users = req.params.users ? req.params.users.split(',') : [req.username]
	var avatars=[]
	Profile.find({username:{$in : users}}).exec(function(err,profiles){
		if(err) return console.log(err)
		if(!profiles || profiles.length == 0){
			res.sendStatus(400)
			return 
		}
		profiles.forEach((profile)=>{
			avatars.push({username:profile.username,avatar:profile.avatar})
		})
		res.send({avatars:avatars})
	})
		
	
}

const putAvatars = (req, res) => {
	const avatar=req.body.avatar
	if(!avatar){
		res.sendStatus(401)
		return
	}
	res.send({
		username:username,
		avatar:avatar
	})
}
const getdob=(req,res)=>{
	const username=req.username
	Profile.find({username:username}).exec(function(err,items){
			const dob = items[0].dob
			res.send({username:username, dob:dob})
		})	
}

module.exports = app => {
	app.get('/', index)
	app.get('/headlines/:users*?',isLoggedIn, getHeadlines)
	app.put('/headline', isLoggedIn,putHeadline)
	app.get('/email/:user?',isLoggedIn, getEmail)
	app.put('/email', isLoggedIn,putEmail)
	app.get('/zipcode/:user?',isLoggedIn, getZipcode)
	app.put('/zipcode', isLoggedIn,putZipcode)
	app.get('/avatars/:users?', isLoggedIn,getAvatars)
	app.put('/avatar',isLoggedIn,putAvatars)
	app.get('/dob',isLoggedIn,getdob)
}
