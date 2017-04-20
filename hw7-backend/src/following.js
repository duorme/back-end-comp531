const Profile = require('./model.js').Profile
const isLoggedIn = require('./middleware.js').isLoggedIn
module.exports = app => {
	app.get('/following/:user?',isLoggedIn,getFollowers)
	app.put('/following/:user',isLoggedIn,addFollower)
	app.delete('/following/:user',isLoggedIn,deleteFollower)
}
// to implement get/add/delete follower 
const getFollowers=(req,res)=>{
	const username = req.params.user? req.params.user:req.username
	Profile.find({username:username}).exec(function(err,profiles){
		if(err) return console.log(err)
		else{
			if(profiles.length == 0){
				res.sendStatus(400)
				return
			}
			res.send({username:username,following:profiles[0].following})
		}
	}) 
}

const addFollower=(req,res)=>{
	const follower=req.params.user
	const username=req.username
	if(!follower){
		res.sendStatus(401)
		return
	}
	Profile.find({username:follower}).exec(function(err,profiles){
		if(err) return console.log(err)
		else{
			if(profiles.length == 0){
				res.sendStatus(400)
				return
			}
			Profile.find({username:username}).exec(function(err,profiles){
				const following = profiles[0].following
				const alreadyFollow = following.filter((item)=>{return item === username})
				if(alreadyFollow.length > 0){
					res.sendStatus(401)
				}
				Profile.update({username:username},{$push:{following:follower}},{new:true},function(err,following){
					if(err){
						return console.log(err)
					}
					else{
						Profile.find({username:username}).exec(function(err,profiles){
							res.send({username:username,following:profiles[0].following})
						})
					}
				})
			})
			
		}
	})
}
const deleteFollower=(req,res)=>{
	const follower=req.params.user
	const username = req.username
	if(!follower){
		res.sendStatus(401)
		return
	}
	Profile.update({username:username},{$pull:{following:follower}},{new:true}).exec(function(err,profiles){
		if(err) return console.log(err)
		Profile.find({username:username}).exec(function(err,profiles) {
			// body...
			if(err) return console.log(err)
			if(profiles.length === 0){
				return res.sendStatus(401)
			}
			res.send({username:username,following:profiles[0].following})
		})


	})
}


