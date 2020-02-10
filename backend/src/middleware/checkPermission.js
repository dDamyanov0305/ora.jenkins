const Workspace = require('../models/Workspace')

module.exports = async (req, res, next) => {

    const { workspace_id } = req.body

    try{
    
        const workspace = await Workspace.findOne({ _id: workspace_id })

        if(!workspace)
            res.sendStatus(404)
        
        if(!workspace.members.includes(req.user._id))
            res.sendStatus(403)
    
        req.workspace = workspace    
        next()
    }
    catch(error){
        console.log(error)
        res.sendStatus(500)
    }
}

