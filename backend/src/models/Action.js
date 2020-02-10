const mongoose = require('mongoose')
const triggerTimes = require('../constants').triggerTimes
const Execution = require('../models/Execution')
const docker = require('../docker/Docker')
const { triggerModes, executionStatus} = require('../constants')
const nodemailer = require('nodemailer')


const actionSchema = mongoose.Schema({
    pipeline_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Pipeline',
        require: true
    },
    name:{
        type: String,
        require: true
    },
    trigger_time:{
        type: String,
        enum: Object.values(triggerTimes),
        require: true
    },
    execute_commands: [String],
    setup_commands: [String],
    docker_image_name: String,
    docker_image_tag: String,
    docker_container_id: {
        type: String,
        default: null
    },
    variables:[
        {
            key: String,    
            value: String
        }
    ],
    prev_action_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Action',
        default: null
    },
    ora_task_id: String,
    ora_project_id: String,
    ora_list_id_on_success: String,
    ora_list_id_on_failure: String,

})

actionSchema.methods.build = async function(triggerMode, comment, executor, revision){

    const config = {
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
    }

    if(!this.docker_container_id){
        container = await docker.createContainer({
            ...config,
            Image: this.docker_image_name,
            Env: this.variables.map(({key, value})=>`${key}=${value}`)
        })

        this.docker_container_id = container.id
    }

   
    const execution = new Execution({
        action_id: this._id,
        status: executionStatus.ENQUED,
        date: Date.now(),
        executor,
        trigger: triggerMode,
        comment,
        revision
    })

    const info = await container.inspect()

    if(!info.State.Running)
        await container.start()


    const num = await Execution.count({action_id:this._id})    
    const pipeline = await Pipeline.findOne({_id: this.pipeline_id})
    const project = await project.findOne({_id: pipeline.project_id})
    const workdir = project.repository.split('/')[1]
    const commands = this.execute_commands.reduce((accumulator, current) => accumulator + " && " + current, `cd ${workdir} && git checkout ${pipeline.branch} && git checkout ${revision}`)
    const setup_commands = `git clone https://github.com/${project.repository}.git && mkdir /var/log/ora.jenkins`

    const executable = initial ? `${setup_commands} && ${commands}` : commands

    const exec = await container.exec({...config, Cmd: ['/bin/bash', '-c', `(${executable}) > /var/log/ora.jenkins/log${num}.log`]})
        
    const stream = await exec.start()
    
    execution.status = executionStatus.INPROGRESS

    const outputStream = new Stream.Writable()
    const errorStream = new Stream.Writable()

    outputStream._write = (chunk, encoding, next) => {
        console.log(chunk.toString())
        next()
    }
    errorStream._write = (chunk, encoding, next) => {
        execution.status = executionStatus.FAILED
        console.log(chunk.toString())
        next()
    } 

    docker.modem.demuxStream(stream, outputStream, errorStream)

    const integration = await Integration.findOne({user_id: pipeline.creator, type: integrationTypes.ORA})

    if(integration){
     
        await fetch(`https://api.ora.pm/projects/${this.ora_project_id}/tasks/${this.ora_task_id}/move`,{
            method:'POST',
            headers:{"Authorization": "Bearer " + integration.token, "Content-Type":"application/json"},
            body:JSON.stringify({
                list_id: execution.status !== executionStatus.FAILED ? this.ora_list_id_on_success:this.ora_list_id_on_failure
            })
        })

        if(execution.status == executionStatus.FAILED)
            emailAssignees(this.ora_project_id,this.ora_task_id)
    }


    const nextAction = await Action.findOne({ prev_action_id: this._id })

    if(nextAction)
        nextAction.build(triggerMode, comment, executor, revision)
}

const emailAssignees = async (project_id ,task_id, token) => {
    const result1 = await fetch(`https://api.ora.pm/projects/${project_id}/tasks/${task_id}/members`,{
        headers:{"Authorization": "Bearer " + token, "Content-Type":"application/json"}
    })

    const result2 = await fetch(`https://api.ora.pm/projects/${project_id}members`,{
        headers:{"Authorization": "Bearer " + token, "Content-Type":"application/json"}
    })

    if(result1.status > 200 && result1.status <= 300 && result2.status > 200 && result2.status){
        const task_members_data = await result1.json()
        const project_members_data = await result2.json()
        const user_ids = task_members_data.data.map(o => o.user_id)
        const emails = project_members_data.data.filter(member => user_ids.includes(member.user_id)).map(member => member.email)


        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: 'ora.jenkins@gmail.com',
              pass: 'ora.jenkinsPass1111' 
            }
          });
        
   
          let info = await transporter.sendMail({
            from: '"ora.jenkins" <ora.jenkins@gmail.com>',
            to: emails.join(),
            subject: `Execution #${num} for pipeline ${name}`, 
            text: "the execution was ...", 
            html: "<b>Hello world?</b>" 
          });

    }

}

const Action = mongoose.model('Action', actionSchema)

module.exports = Action