const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = 'http://localhost:3000'
 // export const url='aaa'

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
describe('Validate Profile functionality', () => {
    it('should update a headline', (done)=>{
        var newHeadline = "this is a new headline for testing"
        var oldHeadline
        resource('GET','headlines')
        .then((res)=>{ 
            oldHeadline = res.headlines[0].headline
        })
        const payload={}
        payload["headline"]=newHeadline
        resource('PUT','headline',payload)           
        .then((res)=>{
            expect(res.headline).to.equal(newHeadline)
        })
        resource('GET','headlines')
        .then(res => {
            expect(res.headlines).to.exist
            expect(res.headlines[0].headline).to.equal(newHeadline)
        })
        .then(done)
        .catch(done)
    }, 200)
});