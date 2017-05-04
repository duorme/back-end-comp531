// this is model.js 
var mongoose = require('mongoose')
require('./db.js')


//article schema
var commentSchema = new mongoose.Schema({
	commentId: String, author: String, date: Date, text: String
})
var articleSchema = new mongoose.Schema({
	author: String, img: String, date: Date, text: String,
	comments: [ commentSchema ]
})

//User schema
var userSchema = new mongoose.Schema({
    username:String,salt:String,hash:String,authId:String,auth:[]
})

var profileSchema = new mongoose.Schema({
	username:String,headline:String,following:[String],email:String,zipcode:String,avatar:String,dob:Date
})



exports.User = mongoose.model('user', userSchema)
exports.Article = mongoose.model('article', articleSchema)
exports.Profile = mongoose.model('profile',profileSchema)
exports.Comment = mongoose.model('comment',commentSchema)

