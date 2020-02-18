const jwt = require('jsonwebtoken')
const User = require('../models/User')


const auth = async(req, res, next) => {
    const tokens = req.header('Authorization')
    
    let token = null

    if(!tokens){
       return res.sendStatus(403).json({error:'Authorization header is missing.'})
    }

    if(tokens.includes('Bearer '))
        token = tokens.replace('Bearer ', '')
    
    if(!token){
        return res.sendStatus(400).json({error:'No authentication token present in header.'})
    }   
    
    try {
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, 'tokens.token': token })

        if (!user) 
            throw new Error()
        
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).json({error: 'Not authorized to access this resource.'})
    }

}

module.exports = auth
