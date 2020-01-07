const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const githubToken = require('../middleware/githubToken')
const { Integration, IntegrationTypes } = require('../models/Integration')
const Project = require('../models/Project')
const { Pipeline, triggerModes } = require('../models/Pipeline')
const { Build, buildStatus } = require('../models/Build')
const exec = require('child_process').exec
const cron = require('node-cron')

router.post('/github/oauth/callback', auth, async (req, res, next) => {
    const {code} = req.query

    if(!code){
        return res.send({
            success:false,
            message: "Error: no code"
        })
    }

    fetch('https://github.com/login/oauth/access_token',
    {
        method:'POST',
        headers:{'Accept':'application/json'},
        body:{
            client_id:process.env.GITHUB_OAUTH_CLIENT_ID,
            client_secret:process.env.GITHUB_OAUTH_CLIENT_SECRET,
            code
        }
    })
    .then(result=>{
        if(result.status!==200)
            return res.status(result.status)
        return result.json()
    })
    .then(data=>{
        Integration.create({
            user_id:req.user._id, 
            type:IntegrationTypes.GITHUB, 
            token:data.access,
        })
        res.send(data)
    })
    .catch(err=>res.status(401))

})


router.post('/github/new', [auth, githubToken], async(req, res) => {

    const {full_name} = req.body

    Project
        .create({user_id: req.user._id, repo_name: full_name})
        .then(project=>res.status(201).send({project}))
        .catch(err=>res.status(500).send(err))

})

router.post('/github/hooks/trigger/:user_id/:repo', async(req, res) => {

    const { user_id, repo } = req.query
    const branch = req.body.ref.split('/')[2]

    Project.findOne({user_id, repo_name: repo}, (err, project) => {
        Pipeline.find({ project_id: project._id, triggerMode: triggerModes.PUSH, branch }, (err, pipelines)=>{
            pipelines.forEach(pipeline => build(repo, pipeline))
        })
    })


})

router.post('/github/manual/trigger', async(req, res) => {

    const { project_id, pipe_id, repo } = req.body

    Pipeline.findOne({ project_id, _id: pipe_id }, (err, pipeline)=>{
        build(repo, pipeline)
    })

})

router.post('/github/schedule', async(req, res) => {

    const { project_id, pipe_id, repo, cron_format_date } = req.body

    Pipeline.findOne({ project_id, _id: pipe_id }, (err, pipeline)=>{
        cron.schedule(cron_format_date, ()=>{
            build(repo, pipeline)
        })
    })
})

const build = (repo, pipeline) => {
    const repo_name = repo.split('/')[1]
    const { commands, branch, _id, nextPipe } = pipeline
    const op = `git clone https://github.com/${repo}.git && cd ${repo_name} && git checkout ${branch} && git pull`
    op += commands.reduce((accum, curr) => accum + ' && ' + curr)
    exec(op, (err, stdout, stderr)=>{

        Build.create({pipe_id: _id, status: err?buildStatus.FAILED:buildStatus.SUCCESSFUL, log: stdout })
        
        if(err){
            console.log(err)
        } else {
            Pipeline.findOne({ _id: nextPipe }, (err, nextPipe) => {
                build(repo, nextPipe)
            })
        }
        
    })
}

module.exports = router