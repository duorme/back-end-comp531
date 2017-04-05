
const articles=[{"_id":3076144,"text":"Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Vivamus aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius.","date":"2015-06-13T12:46:57.503Z","img":null,"comments":[],"author":"cjb6test"},{"_id":2945705,"text":"Pellentesque dapibus hendrerit tortor. Praesent egestas tristique nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio.\r","date":"2015-05-29T02:25:51.750Z","img":"http://lorempixel.com/306/307/","comments":[],"author":"cjb6"},{"_id":4199639,"text":"Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos.\r","date":"2015-09-09T09:49:21.910Z","img":"http://lorempixel.com/330/345/","comments":[],"author":"gradertest"}]


const getArticles = (req, res) => {
	const _id = req.params.id
	if(_id){
		const filterdArticles=articles.filter((item)=>item._id==_id || item.author==_id)
		if(filterdArticles.length===0){
			res.sendStatus(400)
			return
		}
		res.send({articles:filterdArticles})
		return
	}
	res.send({articles:articles})
}
const addArticle = (req,res) =>{
	const newArticle={
	_id:articles.length+1,
	author:"Tong",
	text:req.body['text'],
	date:new Date(),
	comments:[]}
    articles.push(newArticle)
    res.send({articles:[newArticle]})
}
const putArticle=(req,res)=>{
	const text=req.body.text
	const commentId=req.body.commentId
	if(!text){
		res.sendStatus(400)
		return
	}
	if(!commentId){
		res.send({articles:articles})
		return
	}
	res.send({articles:articles})
}

module.exports = (app) => {
	app.get('/articles/:id*?', getArticles)
	app.post('/article',addArticle)
	app.put('/article/:id',putArticle)
}
