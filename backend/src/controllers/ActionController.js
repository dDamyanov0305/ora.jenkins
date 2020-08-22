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

module.exports.execute = async function({ pipeline, pipeline_execution, container }) {

    const gfs = await gfsPromise 

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

	const env = this.variables.map(({ key, value }) => `${key}=${value}`)

	let commands

	// if(this.variables.length !=0 ){
	// 	let variables = this.
	// }

    if(this.shell_script) {

        const readstream = gfs.createReadStream({ _id: this.script_file_id })

        await upload_file_to_container(container, readstream)

        commands = 'chmod +x /bin/execute_script.sh && /bin/execute_script.sh'

    } else {

        commands = this.execute_commands.join(" && ")

	}
	
	const start = new Date()

    const exec = await container.exec({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Env: env,
        Cmd: ['/bin/bash', '-c', commands]
    })


    action_execution.status = executionStatus.INPROGRESS
    // await action_execution.save()
    
    const stream = await exec.start()

    const stream2 = new ReadableStreamClone(stream);

    const outputStream = new Stream.Writable()

    const errorStream = new Stream.Writable()

    const writestream = gfs.createWriteStream({ filename: 'log.txt' })
    
	outputStream._write = (chunk, encoding, next) => {

        console.log(chunk.toString())
        
        next()
	}

	errorStream._write = async(chunk, encoding, next) => {

        action_execution.status = executionStatus.FAILED
        		
        console.log(chunk.toString())
        
		next()
	}

	docker.modem.demuxStream(stream, outputStream, errorStream)
	
    writestream.on('close', async (file) => {

        action_execution.log_id = file._id

        await action_execution.save()
	})
	
	stream2.pipe(writestream)
	
	setTimeout(async() => {

        const res = await exec.inspect()
        
		if(res.Running) {

			await container.kill()
			// const duration = (new Date()).getTime() - start.getTime()
			// action_execution.duration = new Date(duration)
            action_execution.status = executionStatus.TERMINATED
            
            pipeline_execution.status = action_execution.status
            
            await action_execution.save()

            await pipeline_execution.save()
        
            task_action({pipeline, action:this, pipeline_execution})

            resolve(action_execution.status)

		}
	}, 1000*60*25)

    return new Promise((resolve, reject) => 
    {
        try{   

            stream.on('end', async () => 
            {
				const res = await exec.inspect()
				
                if(res.ExitCode !== 0 ) {

					action_execution.status = executionStatus.FAILED
					
				} else {

                    action_execution.status = executionStatus.SUCCESSFUL
                    
				}

                // if(action_execution.status === executionStatus.INPROGRESS){
                //     action_execution.status = executionStatus.SUCCESSFUL
                // }
                await action_execution.save()
    
                pipeline_execution.status = action_execution.status
                await pipeline_execution.save()
        
                task_action({ pipeline, action:this, pipeline_execution })

                resolve(action_execution.status)   

            })

        } catch(error) {

            reject(error.message)

        }

	});

}

const upload_file_to_container = (container, stream) => {

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
            })
        
            archive.pipe(outputStreamBuffer)
            archive.append(stream, { name: "execute_script.sh"})
            archive.finalize().then(() => outputStreamBuffer.end())

        } catch(err) {

            reject(err.message)

        }
        
    })

}

async function task_action({action, pipeline_execution, pipeline}){

    const { task_linkage, ora_task_id, ora_project_id, ora_list_id_on_success, ora_list_id_on_failure } = action
    const { creator_id, name } = pipeline
    const { status } = pipeline_execution

    const integration = await Integration.findOne({user_id: creator_id, type: integrationTypes.ORA})
        
    if(integration && task_linkage) {    
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

        fetch(`https://api.ora.pm/projects/${ora_project_id}/tasks/${ora_task_id}/comments`, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + integration.token, 
                "Content-Type":"application/json"
            },
            body:mJSON.stringify({
                data:`Execution for pipeline ${name} ended with status:${status}`,
                public:true
            })
        })

    }
}

module.exports.delete = async function(){

    const action = this

    const result = await Action.deleteOne({ _id: action._id })
    return result

}

module.exports.save_shell_script = async function(buffer_data) {

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
