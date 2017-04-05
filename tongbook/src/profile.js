// this is profile.js which contains all user profile 
// information except passwords which is in auth.js

const profile={
	username:"Tong",
	headline: 'This is my headline!',
	email: 'foo@bar.com',
	zipcode: 12345,
	avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg',
	dob:new Date()
}

const index = (req, res) => {
	res.send({hello: 'world'})
}
const getHeadlines = (req, res) => {
	if (!req.user) req.user = profile.username
		const users = req.params.users ? req.params.users.split(',') : [req.user]
	if(req.params.users){
		const headlines=users.map((user)=>{
			return {username:`${user}`,headline:`I'm ${user}`}
		})
		res.send({headlines:headlines})
	}
	else{
		res.send({headlines:[{username:req.user,headline:profile.headline}]})
	}
}

const putHeadline = (req, res) => {
	if(!req.body.headline){
		res.sendStatus(400)
		return
	}
	profile.headline=req.body.headline
	res.send({username:profile.username,headline:profile.headline})
}

const getEmail = (req, res) => {
	const user=req.params.user
	if(user){
		res.send({username:user, email: 'a@rice.com'})
		return
	}
	res.send({username:profile.username,email:profile.email})
}

const putEmail = (req, res) => {
	const email=req.body.email
	if(!email){
		res.sendStatus(401)
		return
	}
	profile.email=email
	res.send({
		username:profile.username,
		email:email
	})
}

const getZipcode = (req, res) => {
	const user=req.params.user
	if(user){
		res.send({username:user,zipcode:"77005"})
		return
	}
	res.send({username: profile.username, zipcode:profile.zipcode})
}

const putZipcode = (req, res) => {
	const zipcode=req.body.zipcode
	if(!zipcode){
		res.sendStatus(401)
		return
	}
	profile.zipcode=zipcode
	res.send({
		username:profile.username,
		zipcode:zipcode
	})
}

const getAvatars = (req, res) => {
	if (!req.user) req.user = profile.username
	const users = req.params.users ? req.params.users.split(',') : [req.user]
	if(req.params.users){
		const avatars=users.map((user)=>{
			return {username:`${user}`,avatar:'abc.jpg'}
		})
		res.send({avatars:avatars})
		return
	}
	res.send({avatars:[{username:profile.username,avatar:profile.avatar}]})	
}

const putAvatars = (req, res) => {
	const avatar=req.body.avatar
	if(!avatar){
		res.sendStatus(401)
		return
	}
	profile.avatar=avatar
	res.send({
		username:profile.username,
		avatar:avatar
	})
}
const getdob=(req,res)=>{
	res.send({username:profile.username,dob:profile.dob})
}
module.exports = app => {
	app.get('/', index)
	app.get('/headlines/:users*?', getHeadlines)
	app.put('/headline', putHeadline)
	app.get('/email/:user?', getEmail)
	app.put('/email', putEmail)
	app.get('/zipcode/:user?', getZipcode)
	app.put('/zipcode', putZipcode)
	app.get('/avatars/:users?', getAvatars)
	app.put('/avatar', putAvatars)
	app.get('/dob',getdob)
}
