const ActionExecution = require('../models/ActionExecution')
const Integration = require('../models/Integration')
const docker = require('../docker/Docker')
const { executionStatus, integrationTypes} = require('../constants')
const Stream = require('stream')
const fetch = require('node-fetch')
const ReadableStreamClone = require("readable-stream-clone");
const gfsPromise = require('../db/db')
const archiver = require('archiver')
const streamBuffers = require('stream-buffers');

module.exports.execute = async function({ pipeline, pipeline_execution, container }){

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
        await action_execution.save()
        return action_execution.status
    }

    const env = this.variables.map(({key,value})=>`${key}=${value}`)
    let commands

    if(this.shell_script){
        const gfs = await gfsPromise
        const readstream = gfs.createReadStream({_id: this.script_file_id})
        await upload_script(container, readstream)
        commands = 'chmod +x /bin/execute_script.sh && /bin/execute_script.sh'
    }else{
        commands = this.execute_commands.join(" && ")
    }

    const exec = await container.exec({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Env: env,
        Cmd: ['/bin/bash', '-c', commands]
    })


    action_execution.status = executionStatus.INPROGRESS
    await action_execution.save()
    
    const stream = await exec.start()
    const stream2 = new ReadableStreamClone(stream);
    const outputStream = new Stream.Writable()
    const errorStream = new Stream.Writable()
    const gfs = await gfsPromise 

    docker.modem.demuxStream(stream, outputStream, errorStream)

    let writestream = gfs.createWriteStream({ filename: 'log.txt' });

    writestream.on('close', async (file) => {
        action_execution.log_id = file._id
        await action_execution.save()
    });

    stream2.pipe(writestream)

    return new Promise((resolve, reject) => 
    {
        try{

            outputStream._write = (chunk, encoding, next) => {
                console.log(chunk.toString())
                next()
            }
        
            errorStream._write = async(chunk, encoding, next) => 
            {
                action_execution.status = executionStatus.FAILED
                await action_execution.save()
                console.log(chunk.toString())
                next()
                
            }
    
            stream.on('end', async () => 
            {
                console.log("EXIT CODE: ", exec.inspect())
                console.log('END')
                if(action_execution.status === executionStatus.INPROGRESS){
                    action_execution.status = executionStatus.SUCCESSFUL
                    await action_execution.save()
                }
    
                pipeline_execution.status = action_execution.status
                await pipeline_execution.save()
        
                task_action({pipeline, action:this, pipeline_execution})
                resolve(action_execution.status)   
            })
        }catch(error){
            reject(error)
        }
        
    });

}

const upload_script = (container, script) => {

    return new Promise((resolve, reject) => {
        console.log("started script upload")

        try{
            let outputStreamBuffer = new streamBuffers.WritableStreamBuffer({
                initialSize: (1000 * 1024), 
                incrementAmount: (1000 * 1024) 
            });
            
            outputStreamBuffer.on('finish', async() => {
                console.log("finished buffer")
                container.putArchive(outputStreamBuffer.getContents(),{path:'/bin'})
                .then(()=>{console.log("upload successful");resolve()})
            })
        
            
            let archive = archiver('tar', {
                zlib: { level: 9 }
            });
        
            archive.pipe(outputStreamBuffer);
            archive.append(script, { name: "execute_script.sh"});
            archive.finalize().then(() => outputStreamBuffer.end());
        }catch(err){
            reject(err)
        }
        
    })

}

async function task_action({action, pipeline_execution, pipeline}){

    const { task_linkage, ora_task_id, ora_project_id, ora_list_id_on_success, ora_list_id_on_failure } = action
    const { creator_id, name } = pipeline
    const { status } = pipeline_execution

    const integration = await Integration.findOne({user_id: creator_id, type: integrationTypes.ORA})
        
    if(integration && task_linkage)
    {    
        fetch(`https://api.ora.pm/projects/${ora_project_id}/tasks/${ora_task_id}/move`,
        {
            method:'PUT',
            headers:
            {
                "Authorization": "Bearer " + integration.token, 
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                list_id: status !== executionStatus.FAILED ? ora_list_id_on_success : ora_list_id_on_failure
            })
        })

        fetch(`https://api.ora.pm/projects/${ora_project_id}/tasks/${ora_task_id}/comments`,
        {
            method:'POST',
            headers:
            {
                "Authorization": "Bearer " + integration.token, 
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                data:`Execution for pipeline ${name} ended with status:${status}`,
                public:true
            })
        })

    }
}

module.exports.delete = async function(){

    const action = this
    console.log("deleting action ",action.name)

   const result = await Action.deleteOne({_id:action._id})
   return result

}

module.exports.save_shell_script = async function(buffer_data){
    const gfs = await gfsPromise
    let writestream = gfs.createWriteStream({ filename: 'execute_script.sh' })

    writestream.on('close', async (file) => {
        console.log("file id:", file._id)
        action.script_file_id = file._id
        await action.save()
    });

    var readstream = new streamBuffers.ReadableStreamBuffer({
        frequency: 10,
        chunkSize: 2048 
    }); 

    
    readstream.put(buffer_data);
    readstream.stop()
    readstream.pipe(writestream)
}
