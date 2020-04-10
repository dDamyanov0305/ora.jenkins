const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Pipeline = require('../models/Pipeline')
const Project = require('../models/Project')
const Action = require('../models/Action')
const checkPermission = require('../middleware/checkPermission')
const docker = require('../docker/Docker')
const archiver = require('archiver')
const streamBuffers = require('stream-buffers');
const { exec: node_exec } = require('child_process');

router.post('/actions/all', [auth, checkPermission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const actions = await Pipeline.getActionsForPipeline(pipeline_id)
        res.status(200).json({actions})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }

})

router.post('/actions/get', [auth, checkPermission], async(req, res) => {

    const { pipeline_id, action_id } = req.body

    try{
        const action = await Action.findOne({ pipeline_id, _id: action_id })
        if(!action)
            res.status(404).json({error:'Couldn\'t find action with that id and name.'})
        res.status(200).json(action)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
    
})

router.post('/actions/create', [auth, checkPermission], async(req, res) => {

    const { 
        name, 
        execute_commands, 
        pipeline_id, 
        prev_action_id, 
        next,
        variables, 
        docker_image_name, 
        docker_image_tag,
        shell_script,
        task_linkage,
        ora_task_id,
        ora_project_id,
        ora_list_id_on_success,
        ora_list_id_on_failure
    } = req.body

    console.log(req.body)

    try{
        const pipeline = await Pipeline.findById(pipeline_id)
        const project = await Project.findById(pipeline.project_id)

        const container = await docker.createContainer({
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Image: docker_image_name,
            Env: JSON.parse(variables).map(({key, value})=>`${key}=${value}`)
        })

        if(!container)
            throw new Error("Unable to create container for action.")
        
        await container.start()

        const action = new Action({ 
            name, 
            execute_commands: JSON.parse(execute_commands), 
            pipeline_id, 
            prev_action_id: prev_action_id || null, 
            variables: JSON.parse(variables), 
            docker_image_name, 
            docker_image_tag, 
            docker_container_id: container.id,
            task_linkage: JSON.parse(task_linkage),
            shell_script: JSON.parse(shell_script),
            ora_task_id: JSON.parse(ora_task_id),
            ora_project_id: JSON.parse(ora_project_id),
            ora_list_id_on_success: JSON.parse(ora_list_id_on_success),
            ora_list_id_on_failure: JSON.parse(ora_list_id_on_failure) 
        })

        if(!action){
            throw new Error("Unable to create action.")
        }
        else{
            action.setup_commands = [
                `mkdir /var/log/ora.ci`,
                `apt-get update && apt-get upgrade -y && apt-get install -y git && git clone https://github.com/${project.repository}.git`
            ]

            if(next){
                var next_action = await Action.findById(next)
                next_action.prev_action_id = action._id
            }

            if(JSON.parse(shell_script))
            {
                upload_script(container, req.files.execute_script.data)
                action.setup_commands.push('chmod +x /bin/execute_script.sh')
            }

            const exec = await container.exec({
                AttachStdin: false,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Cmd: ['/bin/bash', '-c', `${action.setup_commands.join(' && ')}`]
            })

            const stream = await exec.start({Tty:true})

            stream.on('data', data => console.log(data.toString()))
    
            action.save()
            next_action.save()

            res.status(201).json({action})
        }

    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.delete('/actions/all', [auth, checkPermission], async(req, res) => {

    const { pipeline_id } = req.body

    try{
        const actions = await Action.find({ pipeline_id })
        actions.forEach(action => action.delete())
        res.status(200).send()
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.delete('/actions', [auth, checkPermission], async(req, res) => {

    const { action_id } = req.body

    console.log(action_id)

    try{
        const action = await Action.findById(action_id)
        const result = await action.delete()
        console.log(result)
        res.status(200).send(result)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

router.post('/actions/test', async(req, res) => {
    //const container = docker.getContainer("575a03090aaade68632bb7ea98ff8df66e487d1c6e89f887410a1636f2f13e62")
    build_image('dimitardocker/ora.jenkins:new3','dimitardocker','dockerAccount','https://github.com/dDamyanov0305/tp-project.git')
})

const upload_script = (container, script) => {

    let outputStreamBuffer = new streamBuffers.WritableStreamBuffer({
        initialSize: (1000 * 1024), 
        incrementAmount: (1000 * 1024) 
    });
    
    outputStreamBuffer.on('finish', async() => {
        await container.putArchive(outputStreamBuffer.getContents(),{path:'/bin'})
    })
   
    
    let archive = archiver('tar', {
        zlib: { level: 9 }
    });

    archive.pipe(outputStreamBuffer);
    archive.append(script, { name: "execute_script.sh"});
    archive.finalize().then(() => outputStreamBuffer.end());

}

const build_image = async(t, username, password, remote) => {

    try{
        console.log("stage 0")

        const stream = await docker.buildImage(null,{remote, t})
        
        console.log("stage 1")

        stream.on('data', data => console.log(data.toString()))
        stream.on('error', () => console.log('ERROR'))
        stream.on('end', async() => {

            console.log('stage 2')

            const image = docker.getImage(t)
            console.log(image)

            if(image){

                console.log('stage 3')

                const container = await docker.createContainer({
                    AttachStdin: false,
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: true,
                    Image: image.name,
                })
                console.log(container.id)

               await container.start()

               console.log('stage 4')

               //execute all commands

               const exec = await container.exec({
                    AttachStdin: false,
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: true,
                    Cmd: ['/bin/bash', '-c', `ls`]
                })

                const exec_stream = await exec.start()

                exec_stream.on('data', data => console.log(data.toString()))
                exec_stream.on('end', ()=>{

                    console.log('stage 5')

                    node_exec(`docker login -u ${username} -p ${password} && docker push ${image.name}`,(error, stdout, stderr) => {
                        
                        if(error){
                            console.error(`exec error: ${error}`);
                            return
                        }

                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);


                    })
                    console.log('DONE')
                })

            }
            
        })
    }catch(e){
        console.log(e)
    }
}


module.exports = router