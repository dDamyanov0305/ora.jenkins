const Workspace = require('../models/Workspace')

module.exports = async (req, res, next) => {

    const { workspace_id } = req.body

    try{
    
        const workspace = await Workspace.findOne({ _id: workspace_id })

        if(!workspace || !workspace.members.includes(req.user._id))
            res.status(403).json({ error: "user doesn't have permissions to this worspace" })
        
        req.workspace = workspace    
        next()
    }
    catch(error){
        console.error(error)
        res.status(500).send()
    }
}

