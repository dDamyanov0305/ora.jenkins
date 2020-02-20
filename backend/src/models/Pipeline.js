const mongoose = require('mongoose')
const Execution = require('../models/Execution')
const Action = require('../models/Action')
const docker = require('../docker/Docker')
const { triggerModes, executionStatus, triggerTimes} = require('../constants')
const nodemailer = require('nodemailer')

const pipelineSchema = mongoose.Schema({
    project_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Project',
        require: true
    },
    creator:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        require: true
    },
    name:{
        type:String,
        require: true
    },
    trigger_mode:{
        type:String,
        enum: Object.values(triggerModes),
        require: true
    },
    branch: {
        type: String,
        default: 'master'
    },
    create_date: Date,
    emailing: {
        type: Boolean,
        default: false
    },
    run_in_parallel: {
        type: Boolean,
        default: false
    },
    push_image:{
        type: Boolean,
        default: false
    }
})

const Pipeline = mongoose.model('Pipeline', pipelineSchema)

pipelineSchema.methods.run = async function(){

    const execution_number_id = await Execution.count({}) 

    const action = Action.findOne({pipeline_id: this._id, prev_action_id: null})

    if(!action) 
        throw new Error("no actions to execute")

    action.execute(triggerMode, comment, req.user.email, revision)

}

const build_image = async (dir_name,repo) => {

    const out = fs.createWriteStream('../../output.tar')
    const stream = await container.getArchive({id: container.id, path: dir_name})
    stream.pipe(out) 

    stream.on('end', async () => {
        const re = fs.createReadStream('../../output.tar')
        const resp = await docker.buildImage(
            re, 
            {
                t: `${repo}:latest`, 
                dockerfile: `./${dir_name}/Dockerfile`, 
                
            }
        )
        resp.on('data', async (data) => {
           
            if(successful_build(data)){

                const img = docker.getImage(`${repo}:latest`)
                const r = await img.push({'X-Registry-Auth':base64auth})

                r.on('data',data => console.log(data.toString()))
                r.on('error',(error) => console.log(error))
                r.on('end',() => console.log('end1'))

            }
        })
        resp.on('error',(error) => console.log(error))
        resp.on('end',() => console.log('end2'))
    })
}


const successful_build = (data) => {
    const obj = JSON.parse(data.toString())
    const match = obj.stream && obj.stream.match(/Successfully built (.*)\n/) || null
    return match
}

const base64auth = Buffer.from(JSON.stringify({ 
    username:'dimitardocker',
    password:'dockerAccount',
    email:'collieryart@gmail.com',
    serveraddress:'https://index.docker.io/v1/'
})).toString('base64')

module.exports = Pipeline