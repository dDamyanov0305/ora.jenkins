const mongoose = require('mongoose')
const Execution = require('../models/Execution')
const docker = require('../docker/Docker')
const { triggerModes, executionStatus, triggerTimes} = require('../constants')
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
    docker_container_id: {
        type: String,
        default: null
    },
    task_linkage:{
        type: Boolean,
        default: null
    },
    docker_image_name: String,
    docker_image_tag: String,
    execute_commands: [String],
    setup_commands: [String],
    ora_task_id: String,
    ora_project_id: String,
    ora_list_id_on_success: String,
    ora_list_id_on_failure: String,

})

actionSchema.methods.build = async function(triggerMode, comment, executor, revision){

    const number = await Execution.count({action_id:this._id}) 

    const execution = new Execution({
        action_id: this._id,
        status: executionStatus.ENQUED,
        date: Date.now(),
        executor,
        trigger: triggerMode,
        comment,
        revision,
        number
    })

    const container = docker.getContainer(this.docker_container_id)
    const info = await container.inspect()

    if(!info.State.Running) await container.start()
       
    const pipeline = await Pipeline.findOne({_id: this.pipeline_id})
    const project = await Project.findOne({_id: pipeline.project_id})

    const pre_execute = [
        `cd ${project.repository.split('/')[1]} && git checkout ${pipeline.branch}`,
        triggerMode === triggerModes.MANUAL ? `git checkout ${revision}` : 'git pull'
    ]

    const executable = initial ? [...this.setup_commands, ...pre_execute, ...this.execute_commands] : [...pre_execute, ...this.execute_commands]

    const exec = await container.exec({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', `(${executable.join(' && ')}) > /var/log/ora.jenkins/log${number}.log`]
    })

    const nextAction = await Action.findOne({ prev_action_id: this._id })
        
    if(nextAction && pipeline.run_in_parallel)
        nextAction.build(triggerMode, comment, executor, revision)
    
    const stream = await exec.start({Tty: true})
    
    execution.status = executionStatus.INPROGRESS

    const outputStream = new Stream.Writable()
    const errorStream = new Stream.Writable()

    errorStream._write = (chunk, encoding, next) => {
        execution.status = executionStatus.FAILED
    } 

    docker.modem.demuxStream(stream, outputStream, errorStream)

    stream.on('end', async () => {

        if(execution.status === executionStatus.INPROGRESS){
            execution.status = executionStatus.SUCCESSFUL
        }

        const integration = await Integration.findOne({user_id: pipeline.creator, type: integrationTypes.ORA})

        if(integration && this.task_linkage){
            await fetch(`https://api.ora.pm/projects/${this.ora_project_id}/tasks/${this.ora_task_id}/move`,{
                method:'POST',
                headers:{"Authorization": "Bearer " + integration.token, "Content-Type":"application/json"},
                body:JSON.stringify({
                    list_id: execution.status !== executionStatus.FAILED ? this.ora_list_id_on_success:this.ora_list_id_on_failure
                })
            })
        }

        if((pipeline.emailing === triggerTimes.ON_FAILURE && execution.status === executionStatus.FAILED) ||
            (pipeline.emailing === triggerTimes.ON_SUCCESS && execution.status === executionStatus.SUCCESSFUL) || 
            (pipeline.emailing === triggerTimes.ON_EVERY_EXECUTION)
        ){
            emailAssignees(this.ora_project_id, this.ora_task_id, integration.token)
        }

        execution.save()

        if(execution.status === executionStatus.SUCCESSFUL && nextAction && !pipeline.run_in_parallel)
            nextAction.build(triggerMode, comment, executor, revision)

    })
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
            to: emails.join(','),
            subject: `Execution #${number} for pipeline ${pipeline.name}`, 
            text: `the execution was ${execution.status}`,
            html: `<a href="http://localhost:3000/execution/${execution.id}">for detailed information follow this link</a>`
          });

    }

}

const Action = mongoose.model('Action', actionSchema)

module.exports = Action