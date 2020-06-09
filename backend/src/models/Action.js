const mongoose = require('mongoose')
const ActionController = require('../controllers/ActionController')
const {triggerTimes} = require('../constants')

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
    docker_image_name: String,
    docker_image_tag: String,
    task_linkage:Boolean,
    ora_task_id: Number,
    ora_project_id: Number,
    ora_list_id_on_success: Number,
    ora_list_id_on_failure: Number,
    shell_script:Boolean,
    script_file_id:String,
    
})

actionSchema.methods.execute = ActionController.execute
actionSchema.methods.delete = ActionController.delete

const Action = mongoose.model('Action', actionSchema)
module.exports = Action
