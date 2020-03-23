const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkPermission = require('../middleware/checkPermission')
const Project = require('../models/Project')

router.post('/projects/all', [auth, checkPermission], async(req, res) => {

    try{
        const projects = await Project.find({ workspace_id: req.workspace._id })
        res.status(200).json({projects})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

router.post('/projects/get', [auth, checkPermission], async(req, res) => {

    const { project_id } = req.body

    try{
        const projects = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })

        if(!projects)
            res.status(404).send('Couldn\'t find project with that id and name.')

        res.status(200).json({projects})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
    
})


router.post('/projects/create', [auth, checkPermission], async(req, res) => {

    const { name, repository, hosting_provider } = req.body

    try{
        const project = await Project.create({ name, repository, hosting_provider, workspace_id: req.workspace._id, assigned_team: [req.user._id] })
        res.status(201).json({project})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.post('/projects/assign', [auth, checkPermission], async(req, res) => {

    const { project_id, assignee_id } = req.body

    try{
        const project = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })
        const assignee = await User.findOne({ _id: assignee_id })

        if(!project || !assignee)
            res.status(404).json({error:"Couldn\'t find project with that id and name."})

        project.assigned_team.push(assignee_id)
        project.save()

        res.status(200).json({project})
    }
    catch(error){
        console.log(error)
        res.status(500).send({error})
    }
})

router.post('/projects/unassign', [auth, checkPermission], async(req, res) => {

   const { project_id, assignee_id } = req.body

    try{
        const project = await Project.findOne({ workspace_id: req.workspace._id, _id: project_id })
        const assignee = await User.findOne({ _id: assignee_id })

        if(!project || !assignee)
            res.status(404).send("Couldn\'t find project with that id and name.")

        project.assigned_team = project.assigned_team.filter(id => id != assignee_id)
        project.save()
        res.status(200).json({project})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.delete('/projects/all', [auth, checkPermission], async(req, res) => {

    try{
        const projects = await Project.find({ workspace_id: req.workspace._id })
        projects.forEach(project => project.delete())
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.delete('/projects', [auth, checkPermission], async(req, res) => {

    const { project_id } = req.body

    try{
        const project = await Project.findById(project_id)
        project.delete()
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})



module.exports = router