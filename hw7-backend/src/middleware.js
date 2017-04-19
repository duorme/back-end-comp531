const cookieKey='sid'
const redis = require('redis').createClient("redis://h:pfe02f6bf53b86af67751ca5f35cf44707b4e8d7fedb1c12ecc127509755e24a4@ec2-34-206-56-163.compute-1.amazonaws.com:27519")

const isLoggedIn=(req,res,next)=>{
	const sid = req.cookies[cookieKey]
	if(!sid){
		return res.status(401).send('NOT Authorized')
	}
	redis.hgetall(sid, function(err, userObj) {
    	if(err) {
    		console.log('Error: ${err}')
    	}
    	// console.log(sid + 'mapped to ' + userObj.username)
    	if(userObj){
    		req.username = userObj.username
			next()
		}
		else{
			res.redirect('/login')
		}
    })
}
exports.isLoggedIn=isLoggedIn