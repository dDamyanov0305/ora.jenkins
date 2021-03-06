const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Worksapce = require('./Workspace')
const Integration = require('./Integration')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        /*validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }*/
    },
    password: {
        type: String,
        required: true,
        minLength: 5
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    create_date:{
        type: Date,
        default: Date.now()
    }
})

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) 
        user.password = await bcrypt.hash(user.password, 8)
    
    next()

})

userSchema.methods.generateAuthToken = async function() {

    const user = this   

    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)

    user.tokens = user.tokens.concat({token})

    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({email})

    if (!user) 
        throw new Error('Could\'t find user with that email.')
    
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    
    if (!isPasswordMatch) 
        throw new Error('Invalid password.')
    
    return user
}

userSchema.methods.delete = async function() {

    
    const user = this

    console.log('deleting user ', user.name)

    const workspaces = await Worksapce.find({ user_id: user._id })
    const integrations = await Integration.find({ user_id: user._id })

    let workspace_deletes = workspaces.map(async(workspace) => await workspace.delete())

    let integration_deletes = integrations.map(async(integration) => 
    {
        if(integration.type === integrationTypes.GITHUB)
        {
            fetch(`https://api.github.com/applications/${GITHUB_OAUTH_CLIENT_ID}/tokens/${integration.token}`,{
                method:'DELETE'
            })
            .then(res => console.log("result from token delete: ",res.status))
        }
        return await Integration.deleteOne({_id:integration._id})
        
    })

    return new Promise((resolve,reject) => {

        Promise.all([...workspace_deletes, ...integration_deletes])
        .then(() => {
            User.deleteOne({_id:user._id})
            .then((val) => resolve(val))
            .catch((error) => reject(error))
        })
       
    })


}

const User = mongoose.model('User', userSchema)

module.exports = User