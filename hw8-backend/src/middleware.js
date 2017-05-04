const cookieKey='sid'
const redis = require('redis').createClient("redis://h:pfe02f6bf53b86af67751ca5f35cf44707b4e8d7fedb1c12ecc127509755e24a4@ec2-34-206-56-163.compute-1.amazonaws.com:27519")
// check user is authorized
const User = require('./model.js').User

const isLoggedIn = (req, res, next) => {
	// req.username='TongZhou@facebook'
	if (req.isAuthenticated()) {
        User.findOne({auth: {'facebook': req.user.username}}).exec(function(err, user) {
            if (!user) {
                req.username = req.user.username
            }
            else {
                req.username = user.username
            }
            next()
        })		
	}

    else if (!req.cookies[cookieKey]) {
        return res.status(401).send('Cookie not exist!')
    } else {
        redis.hgetall(req.cookies[cookieKey], function(err, userObj) {
            if (userObj) {
                req.username = userObj.username
                next()
            } else {
                return res.status(401).send()
            }
        })
    }
}
exports.isLoggedIn=isLoggedIn