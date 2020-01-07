const githubToken = (req, res, next) => {
    const tokens = req.header('Authorization').split(',')
    
    for(let t in tokens){
        if(t.includes('token ')){
            req.user.github_token = t
            next()
        }
    }
}

module.exports = githubToken
