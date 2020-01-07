const { Pipeline, triggerModes } = require('../models/Pipeline')

async(req, res) => {

    const {repo, project_id, name, branch, triggerMode} = req.body

    fetch(`https://api.github.com/repos/${repo}/hooks`,
        {
            method:'POST',
            headers:{
                "Content-type": "application/json",
                "Authorization": req.user.githubToken
            },
            body:{
                "name": "web",
                "active": true,
                "events": [
                    "push",
                ],
                "config": {
                    "url": `https://localhost:5000/github/hooks/trigger/${req.user._id}/${repo}`,
                    "content_type": "json",
                    "insecure_ssl": "0"
                }
            }
        }
    )
    .then(result=>{
        if(result.status!==200)
            return res.status(result.status)
        return result.json()
    })
    .then(hook=>{
        Pipeline.create({ project_id, triggerMode, name, branch })
        res.status(201).send()
    })
    .catch(err=>res.status(401).send(err))

}