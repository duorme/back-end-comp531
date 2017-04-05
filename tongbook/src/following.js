module.exports = app => {
	app.get('/following/:user?',getFollowers)
	app.put('/following/:user',addFollower)
	app.delete('/following/:user',deleteFollower)
}
const loginUser="Tong"
var followers=["tz13","tz13Test","scott"]
const getFollowers=(req,res)=>{
	const user=req.params.user
	if(user){
		res.send({username:user,following:followers})
		return
	}
	res.send({username:loginUser,following:followers})
}

const addFollower=(req,res)=>{
	const user=req.params.user
	if(!user){
		res.sendStatus(401)
		return
	}
	followers.push(user)
	res.send({username:loginUser,following:followers})
}
const deleteFollower=(req,res)=>{
	const user=req.params.user
	if(!user){
		res.sendStatus(401)
		return
	}
	followers=followers.filter((item)=>item!=user)
	res.send({username:loginUser,following:followers})
}


