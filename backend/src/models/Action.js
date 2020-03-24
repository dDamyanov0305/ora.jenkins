const mongoose = require('mongoose')
const ActionExecution = require('./ActionExecution')
const Integration = require('./Integration')
const docker = require('../docker/Docker')
const { triggerModes, executionStatus, triggerTimes, integrationTypes} = require('../constants')
const Stream = require('stream')
const { exec: node_exec } = require('child_process');


const actionSchema = mongoose.Schema({
    pipeline_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Pipeline',
        required: true
    },
    name:{
        type: String,
        required: true
    },
    trigger_time:{
        type: String,
        enum: Object.values(triggerTimes),
    },
    execute_commands: {
        type: [String],
        required:true
    },
    setup_commands: [String],
    variables:[
        {
            key: {
                type: String,
                required:true
            },    
            value: {
                type: String,
                required:true
            },
        }
    ],
    prev_action_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Action',
        default: null
    },
    path:{
        type: String,
        default: 'Dockerfile'
    },
    docker_container_id: String,
    docker_image_name: String,
    docker_image_tag: String,
    task_linkage:Boolean,
    ora_task_id: Number,
    ora_project_id: Number,
    ora_list_id_on_success: Number,
    ora_list_id_on_failure: Number,
    shell_script:Boolean
})

actionSchema.methods.delete = async function(){

    const action = this
    console.log(action)

    if(action.docker_container_id){
        const container = docker.getContainer(action.docker_container_id)
        const info = await container.inspect()
        if(info.State.Running)
            await container.stop()

        const res = await container.remove()
        
        console.log(res)
    }

   const result = await Action.deleteOne({_id:action._id})
   return result

}


actionSchema.methods.execute = async function({ repository, branch, creator, revision, pipeline_execution, ind }){

    const action_execution = await ActionExecution.create({
        action_id: this._id,
        execution_id: pipeline_execution._id,
        status: executionStatus.ENQUED,
        date: Date.now(),
    })

    if(pipeline_execution.status !== executionStatus.SUCCESSFUL && 
        pipeline_execution.status !== executionStatus.INPROGRESS)
    {
        action_execution.status = executionStatus.NOT_EXECUTED
        action_execution.save()
        return
    }

    const container = docker.getContainer(this.docker_container_id)
    const info = await container.inspect()
    if(!info.State.Running) await container.start()
       
    let executable = [`cd ${repository} && git checkout ${branch} && git pull`]

    if(revision)
        executable.push(`git checkout ${revision}`)

    if(this.shell_script)
    {
        executable.push('/bin/execute_script.sh')
    }
    else
    {
        executable = executable.concat(this.execute_commands)
    }
       

    const exec = await container.exec({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: false,
        Cmd: ['/bin/bash', '-c', `touch /var/log/ora.ci/log_${ind}.log && (${executable.join(" && ")}) > /var/log/ora.ci/log_${ind}.log`]
    })

      
    action_execution.status = executionStatus.INPROGRESS
    action_execution.save()
    
    const stream = await exec.start()
    const outputStream = new Stream.Writable()
    const errorStream = new Stream.Writable()
    
    docker.modem.demuxStream(stream, outputStream, errorStream)
    
    return new Promise((resolve, reject) => 
    {
        outputStream._write = (chunk, encoding, next) => next()
    
        errorStream._write = (chunk, encoding, next) => 
        {
            action_execution.status = executionStatus.FAILED
            action_execution.save()
            console.log(chunk.toString())
            console.log('ERROR')
            next()
        }

        stream.on('end', async () => 
        {
            console.log('END')
            
            if(action_execution.status === executionStatus.INPROGRESS){
                action_execution.status = executionStatus.SUCCESSFUL
                action_execution.save()
            }

            pipeline_execution.status = action_execution.status
            await pipeline_execution.save()
    
            const integration = await Integration.findOne({user_id: creator, type: integrationTypes.ORA})
    
            if(integration && this.task_linkage)
            {    
                const taskMovement = await fetch(`https://api.ora.pm/projects/${this.ora_project_id}/tasks/${this.ora_task_id}/move`,
                {
                    method:'PUT',
                    headers:
                    {
                        "Authorization": "Bearer " + integration.token, 
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        list_id: pipeline_execution.status !== executionStatus.FAILED ? 
                        this.ora_list_id_on_success :
                        this.ora_list_id_on_failure
                    })
                })
    
                console.log(taskMovement.status)
            }

            resolve(action_execution.status)   
        })
        
    });

}

actionSchema.methods.build_and_push = async function({dir_name, docker_username, docker_password, docker_repository, docker_image_tag, path}){

    const { docker_container_id: id } = this
    const t = `${docker_repository}:${docker_image_tag}`
    const dockerfile = `./${dir_name}/${path}`

    let buffs = []
    const stream = await container.getArchive({ id, path })

    stream.on('data', (data) => { buffs.push(data) })

    stream.on('end', async () => 
    {
        const buff = Buffer.concat(buffs)
        const buildStream = await docker.buildImage(buff, { t, dockerfile })

        buildStream.on('data', async (data) => console.log( data.toString() ) )
        buildStream.on('error',(error) => console.log(error))
        buildStream.on('end',() => 
        {
            node_exec(`docker login -u ${docker_username} -p ${docker_password} && docker push ${image.name}`,(error, stdout, stderr) => 
            {
                        
                if(error){
                    console.error(`exec error: ${error}`);
                    return
                }

                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);

            })
        })
    })
}

actionSchema.methods.getLog = async function(ind)
{
    const container = docker.getContainer(this.docker_container_id)
    const info = await container.inspect()

    if(!info.State.Running) await container.start()

    const exec = await container.exec({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', `cat /var/log/ora.ci/log_${ind}.log`]
    })

    const stream = await exec.start({Tty:true})

    return new Promise((resolve, reject) => 
    {
        let data = "";
        
        stream.on("data", chunk => data += chunk);
        stream.on("end", () => resolve(data));
        stream.on("error", error => reject(error));
    });

}

const Action = mongoose.model('Action', actionSchema)
module.exports = Action
