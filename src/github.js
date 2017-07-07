let request = require('request')
function _getMaxPage(linkHeader) {
  if (!linkHeader)
    return 0;
  let lastLink = linkHeader.split(',').find(link => link.includes('last'))
  return parseInt(/(?:\?|&)page=(\d+)/.exec(lastLink)[1])
}
function retrieveIssues(user, repo, page, perPage) {
  return new Promise((resolve, reject) => {
      request(`https://api.github.com/repos/${user}/${repo}/issues?page=${page || 1}&per_page=${perPage || 100}`, (error, res, body) => {
         if (res.statusCode !== 200)
            reject(JSON.parse(body).message)
         else {
            let result = JSON.parse(body)
            resolve({
              result: result.map(i => ({
                  number: i.number, 
                  title: i.title, 
                  openDate: i.created_at,
                  author: i.user.login,
                  authorAvatar: i.user.avatar_url,
                  authorLink: i.user.html_url
              })),
              maxPage: _getMaxPage(res.headers['link'])
            })
         }
      })
   })
}
function retrieveUserRepos(user) {
   return new Promise((resolve, reject) => {
      request(`https://api.github.com/users/${user}/repos?per_page=100`, (error, res, body) => {
         if (res.statusCode !== 200)
            reject(JSON.parse(body).message)
         else {
            let result = JSON.parse(body)
            resolve(result.map(r =>r.name))
         }
      })
   })
}
module.exports = { retrieveIssues, retrieveUserRepos }