const expect = require('chai').expect
const fetch = require('isomorphic-fetch')
const url = 'http://localhost:3000'
resource = (method, endpoint, payload) => {
  const options =  {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }

  }
  if (payload) options.body = JSON.stringify(payload)

  return fetch(`${url}/${endpoint}`, options)
    .then((r) => {
      if (r.status === 200) {
        return (r.headers.get('Content-Type').indexOf('json') > 0) ? r.json() : r.text()
      } else {
        // useful for debugging, but remove in production
        console.error(`${method} ${endpoint} ${r.statusText}`)
        throw new Error(r.statusText)
      }
    })
}
describe('Validate Put Articles', () => {
    it('should Put Articles', (done)=>{
    	var length
    	const newArticle="this is a new article"
        resource('GET','articles')
        .then((res)=>{ 
            length=res.articles.length
        })
        const payload={}
        payload["text"]=newArticle
        resource('POST','article',payload)           
        .then((res)=>{
            expect(res.articles[0].text).to.equal(newArticle)
        })
        resource('GET','articles')
        .then(res => {        	
            expect(res.articles.length).to.equal(length+1)
        })
        .then(done)
        .catch(done)
    }, 200)
});
