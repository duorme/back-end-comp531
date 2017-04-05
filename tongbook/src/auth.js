const md5 = require('md5')

var loginUser=''
const cookieKey='sid'
const userObj={}
const logout=(req,res)=>{
	loginUser=''
	res.cookie(cookieKey,null,
		{maxAge:-1,httpOnly:true})
	res.status(200).send("OK")
}
const userRegister=(req,res)=>{
	var username = req.body.username
	var password = req.body.password
	var email=req.body.email
	var dob=req.body.dob
	var zipcode=req.body.zipcode
	if(!username || !password||userObj[username]){
		res.sendStatus(400)
		return
	}
	const salt=new Date()+username
	const Saltedpassword=md5(salt+password)
	const newUser={username:username,salt:salt,hash:Saltedpassword,dob:dob,email:email,zipcode:zipcode}
	userObj[username]=newUser
	var msg = {username:username,result:'success'}
	res.send(msg)
}
const getUser=(username)=>userObj[username]
const generateCode=(userObj)=>{md5(userObj.username+userObj.password)}

const userlogin=(req,res)=>{
	var username = req.body.username
	var password = req.body.password
	if(!username || !password){
		res.sendStatus(400)
		return
	}
	var user=getUser(username)
	if(!user){
		res.sendStatus(401)
		return
	}
	const passSalted=md5(user.salt+password)
	if(passSalted !== user.hash){
		res.sendStatus(401)
		return
	}
	loginUser=username
	res.cookie(cookieKey,generateCode(user),
		{maxAge:3600*1000,httpOnly:true})
	var msg = {username:username,result:'success'}
	res.send(msg)
}
const putPassword=(req,res)=>{
	var password=req.body.password
	if(!password){
		res.sendStatus(400)
	}
	if(loginUser==''){
		res.sendStatus(401)
		return
	}
	var user=getUser(loginUser)
	const passSalted=md5(user.salt+password)
	user.hash=passSalted
	res.send({username:loginUser,status:'will not changed'})
}
module.exports = app =>{
	app.post('/register',userRegister)
	app.post('/login',userlogin)
	app.put('/logout',logout)
	app.put('/password',putPassword)
}
