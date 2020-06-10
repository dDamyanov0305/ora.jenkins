const Integration = require('../models/Integration')
const integrationTypes = require('../constants').integrationTypes
const PipelineExecution = require('../models/PipelineExecution')
const ActionExecution = require('../models/ActionExecution')
const Action = require('../models/Action')
const Pipeline = require('../models/Pipeline')
const docker = require('../docker/Docker')
const transporter = require('../transporter')
const { triggerModes, executionStatus, emailConditions} = require('../constants')
const fetch = require('node-fetch')

async function build_image({remote, t, pipeline_execution}){

    const stream = await docker.buildImage(null,{remote, t})

    return new Promise((resolve, reject)=>{
        stream.on('data', data => console.log(data))
        stream.on('error', () => reject("build error"))
        stream.on('end', async() => {

            const image = docker.getImage(t)

            if(image){
                console.log("IMAGE BUILT")
                resolve(image)
            }else{
                pipeline_execution.status = executionStatus.FAILED
                await pipeline_execution.save()
                reject("no image")
            }
 
        })
    })
   
}

async function test_image({image, config, pipeline, pipeline_execution}){

    const { trigger_mode, comment, revision, executor, email_recipients, user_id } = config
    const { _id, emailing, name  } = pipeline

    
    //create pipeline execution
    // const pipeline_execution = new PipelineExecution({  
    //     pipeline_id: _id, 
    //     user_id,
    //     trigger_mode, 
    //     comment, 
    //     revision, 
    //     executor,
    //     status:executionStatus.INPROGRESS 
    // })

    const index = await PipelineExecution.find({pipeline_id: _id}).where('date').lte(pipeline_execution.date).countDocuments()
    const actions = await module.exports.getActionsForPipeline(_id)

    const container = await docker.createContainer({ AttachStdin: false, AttachStdout: true, AttachStderr: true, Tty: true, Image: image.name })
    await container.start()
    console.log(actions)
    for(action of actions){console.log("vliza")
        let status = await action.execute({pipeline, pipeline_execution, container})
        console.log("STATUS: ", status)
    }
    
    if(emailing == emailConditions.ON_EVERY_EXECUTION || 
        (emailing == emailConditions.ON_SUCCESS && pipeline_execution.status == executionStatus.SUCCESSFUL) ||
        (emailing == emailConditions.ON_FAILURE && pipeline_execution.status == executionStatus.FAILED)
    ){
        send_emails({email_recipients, pipeline_execution, index, name})
    }

    await container.stop()
    await container.remove()
    return pipeline_execution.status
    
}

async function push_img(image, options){
    let stream = await image.push(options)
    stream.on('data',(data)=>console.log(data.toString()))
    stream.on('error',()=>console.log('error'))
    stream.on('end',()=>console.log('end'))
}

async function send_emails({email_recipients, pipeline_execution, index, name}){

    let info = await transporter.sendMail({
        from: '"Ora.CI" <dimitar.damyanov0305@gmail.com>',
        to: email_recipients.join(','),
        subject: `Execution #${index} for pipeline ${name}`, 
        text: `status: ${pipeline_execution.status}`,
        // html: `<a href="http://localhost:3000/execution/${pipeline_execution._id}">for detailed information follow this link</a>`
    })

    console.log(info)
}

async function create_gitlab_hook({pipeline, token, project}){

    const result = await fetch(`https://gitlab.com/api/v4/projects/${project.repo_id}/hooks`,{
        method:'POST',
        headers:{
            "Content-type": "application/json",
            "Authorization": "PRIVATE-TOKEN: " + token
        },
        body:JSON.stringify({
            url: `${process.env.SERVER_ADDRESS}/pipelines/${pipeline._id}/webhook-trigger`,
            push_events: true,
            push_events_branch_filter: pipeline.branch
        })
    })

    if(result.status < 200 || result.status >= 300){
        console.log(result.status)
        throw new Error(result.status)
    }
    else{
        const { id: hook_id } = await result.json()
        pipeline.hook_id = hook_id
        pipeline.save()
    }
}

async function create_github_hook({pipeline, token, project}){
    
    const result = await fetch(`https://api.github.com/repos/${project.repository}/hooks`,{
        method:'POST',
        headers:{
            "Content-type": "application/json",
            "Authorization": "token " + token
        },
        body:JSON.stringify({
            "name": "web",
            "active": true,
            "events": [
                "push",
            ],
            "config": {
                "url": `${process.env.SERVER_ADDRESS}/pipelines/${pipeline._id}/webhook-trigger`,
                "content_type": "json",
                "insecure_ssl": "0"
            }
        })
    })

    if(result.status < 200 || result.status >= 300){
        console.log(result.status)
        throw new Error(result.status)
    }
    else{
        const { id: hook_id } = await result.json()
        pipeline.hook_id = hook_id
        pipeline.save()
    }
}

module.exports.run = async function(args){

    const { project, trigger_mode, comment, revision, executor, user_id } = args

    const { docker_user, docker_repository, docker_image_tag, docker_password, push_image, workdir } = this
    const integration = await Integration.findOne({user_id, type: integrationTypes.GITHUB})

    const pipeline_execution = new PipelineExecution({  
        pipeline_id: this._id, 
        user_id,
        trigger_mode, 
        comment, 
        revision, 
        executor,
        status:executionStatus.INPROGRESS 
    })

    console.log("EXECUTION")

    let t = push_image ? `${docker_repository}:${docker_image_tag}` : 'default_tag'
    let remote = `https://${integration.token}@github.com/${project.repository}.git#${revision.sha}:${workdir}`

    const image = await build_image({remote, t, pipeline_execution})
    
    const status = await test_image({image, config:args, pipeline:this, pipeline_execution})

    if(push_image && status === executionStatus.SUCCESSFUL)
    {
        await push_img(image,{username:docker_user, password:docker_password},)
    }


    return pipeline_execution
    
}

module.exports.getActionsForPipeline = async (pipeline_id) => 
{
    const actions = await Action.find({ pipeline_id })
    
    const ordered = []

    let next = actions.find(action => action.prev_action_id == null)

    while(next)
    {
        ordered.push(next)
        next = actions.find(action => JSON.stringify(action.prev_action_id) == JSON.stringify(next._id))
    }

    return ordered
}

module.exports.getActionExecutions = async function(pipeline_id, pipeline_execution_id){

    const actions = await module.exports.getActionsForPipeline(pipeline_id)

    const action_executions = actions.map(async(action)=>{

        
        let ax = await ActionExecution.findOne({action_id: action._id, execution_id: pipeline_execution_id})
        let log = null
        if(ax.log_id){
            log = await ax.getlog(ax.log_id)
        }
        return { ...ax.toObject(), log, action }
    })
    let res = await Promise.all(action_executions)
    console.log(res)
    return res

}

module.exports.delete = async function(project, user) {

    const pipeline = this

    console.log('deleting pipeline ', pipeline._id)

    const actions = await Action.find({ pipeline_id: pipeline._id })
    const pipeline_executions = await PipelineExecution.find({ pipeline_id: pipeline._id })

    if(pipeline.cron_container_id){
        const res = await docker.getContainer(pipeline.cron_container_id).remove()
        console.log(res)
    }

    let action_deletes = actions.map(async(action) => await Action.deleteOne({_id:action._id}))
    let pipeline_ex_deletes = pipeline_executions.map(async(pipeline_execution) => await pipeline_execution.delete())

    return new Promise((resolve,reject) => {

        Promise.all([...action_deletes, ...pipeline_ex_deletes])
        .then(async() => {
            console.log("finished deleting subresources")
            const integration = await Integration.findOne({user_id: user._id, type: integrationTypes.GITHUB})
            if(pipeline.trigger_mode === triggerModes.PUSH){
                console.log("deleting github webhook start")
                let res = await fetch(`https://api.github.com/repos/${project.repository}/hooks/${this.hook_id}`,{
                    method:'DELETE',
                    headers:{
                        "Content-type": "application/json",
                        "Authorization": "token " + integration.token
                    }
                })

                console.log("deleting github webhook ",res)

            }

            Pipeline.deleteOne({_id:pipeline._id})
                .then((val) => resolve(val))
                .catch((error) => reject(error))
        
        })
       
    })

}

module.exports.create_cron_job = async function({pipeline, token, cron_date}){

    pipeline.cron_date = cron_date

    const cron_arr=cron_date.split(" ")

    if(cron_arr.length != 5){
        throw new Error("invalid cron date")
    }

    for(let i of cron_arr){

        if(i!== '*' && (i<"0" || i>"9")&&i!=='/'){
            console.log(i+'|')
            throw new Error("invalid cron date characters")
        }
    }

    const setup_commands = [
        'apt-get update && apt-get install -y cron && apt-get install -y curl',
        'touch /etc/cron.d/cron-job',
        `echo -e "${pipeline.cron_date} curl -H 'Authorization: Bearer ${token}' -X POST ${process.env.SERVER_ADDRESS}/pipelines/${pipeline._id}/cron-trigger\n" > /etc/cron.d/cron-job`,
        'chmod 0644 /etc/cron.d/cron-job',
        'crontab /etc/cron.d/cron-job',
        'cron'
    ].join(' && ')



    const container = await docker.createContainer({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Image: 'ubuntu',
        Env: [`AUTH=${token}`]
    })

    if(!container)
        throw new Error("Unable to create container for cron pipeline.")

    await container.start()

    pipeline.cron_container_id = container.id

    const exec = await container.exec({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', `${setup_commands}`]
    })

    
    const stream = await exec.start({Tty: true})
    return new Promise((resolve,reject)=>{

        stream.on('data',(data)=>{
            console.log(data.toString())
        })
    
        stream.on('error',()=>{
            throw new Error('Couldn\'t setup cron task for pipeline.')
        })
    
        stream.on('end',async()=>{
            console.log('end')
            await pipeline.save()
            resolve(pipeline)
        })
    })

}

module.exports.create_hook = async function({project, pipeline, user_id}){
    
    const integration = await Integration.findOne({user_id, type: project.hosting_provider})

    switch(project.hosting_provider){
        case integrationTypes.GITHUB: create_github_hook({pipeline, token:integration.token, project}); break;
        case integrationTypes.GITLAB: create_gitlab_hook({pipeline, token:integration.token, project}); break;
        case integrationTypes.BITBUCKET: create_bitbucket_hook({pipeline:integration.token, token, project}); break;
    }
}
