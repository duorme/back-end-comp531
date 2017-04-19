const md5 = require('md5')
const Article = require('./model.js').Article
const Profile = require('./model.js').Profile
const isLoggedIn = require('./middleware.js').isLoggedIn

const getArticles = (req, res) => {

	const username = req.username
	const _id = req.params.id
	if(_id){
		Article.find({_id:_id}).exec(function(err,items){
			if(err){
				return console.log(err)
			}
			if(items.length > 0){
			res.send({articles:items[0]})
			return
			}
			else{
				Article.find({author:_id}).exec(function(err,items){
					if(err){
						return console.log(err)
					}
					if(items.length > 0){
						return res.send({articles:items})
					}
					else{
						res.sendStatus(401)
						return
					}
				})
			}
		})
	}
	else{
		Profile.find({username:username}).exec(function(err,items){
		if(err){
				return console.log(err)
		}
		const userObj = items[0]
		const following = userObj.following
		following.push(username)
		Article.find({author: {$in : following}}).exec(function(e, docs){
            if (e){
                console.log(err)
                res.sendStatus(500)
                return
            }
            res.send({articles: docs})
            return
        })
	})
	}
}
const addArticle = (req,res) =>{
	const username = req.username
	const newArticle = new Article({author:username,text:req.body['text'],date:new Date(),comments:[]})
	.save(function(err,item){
		if(err){
			console.log(err)
		}
    	res.send({articles:[item]})
	})

}
const putArticle=(req,res)=>{
	const text=req.body.text
	const commentId=req.body.commentId
	const id = req.params.id
	if(!text){
		res.sendStatus(400)
		return
	}
	Article.find({_id:id}).exec(function(err,articles){
			if(articles.length == 0){
				res.sendStatus(400)
				return
			}
			if(!commentId){
			if(articles[0].author != req.username){
				res.sendStatus(400)
				return
			}
			const id=req.params.id
			Article.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }, function(err, item) {
			    if (err) return console.log(err)
			    res.send({ articles: [item] })
			})
			}
			else{
				const article = articles[0]
				if(commentId == -1){
					const commentId=md5(req.username+new Date())
					const comment={commentId:commentId,author:req.username,date:new Date(),text:text}
					const newcomments = article.comments
					newcomments.push(comment)
					Article.findByIdAndUpdate(id, { $set: {comments:newcomments} }, { new: true }, function(err, item) {
			    	if (err) return console.log(err)
			    	res.send({ articles: [item] })
					})
				}
				else{
					var comment = article.comments.filter((item)=>{return item.commentId==commentId})
					if(comment.length == 0){
						res.sendStatus(400)
						return
					}
					if(comment[0].author != req.username){
						res.sendStatus(400)
						return
					}
					const newcomments = article.comments
					newcomments.forEach((item)=>{if(item.commentId === commentId){
						item.text=text
					}})
					Article.findByIdAndUpdate(id, { $set: {comments:newcomments} }, { new: true }, function(err, item) {
			    	if (err) return console.log(err)
			    	res.send({ articles: [item] })
					})
				}
			}

			
		})
	
}

module.exports = (app) => {
	app.get('/articles/:id*?', isLoggedIn,getArticles)
	app.post('/article',isLoggedIn,addArticle)
	app.put('/articles/:id',isLoggedIn,putArticle)
}
