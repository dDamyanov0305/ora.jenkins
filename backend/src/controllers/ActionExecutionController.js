const gfsPromise = require('../db/db')

module.exports.getlog = async function(log_id){

    const gfs = await gfsPromise
    let readstream = await gfs.createReadStream({_id: log_id});

    let data = "";

    return new Promise((resolve, reject)=>{
        readstream.on("data", chunk => {console.log(data);data += chunk});
        readstream.on("end", () => resolve(data));
        readstream.on("error", error => reject(error));
    })
}

module.exports.delete = async function(){

    const gfs = await gfsPromise

    console.log('deleting action execution ', this._id)

    return new Promise((resolve,reject)=>{
        gfs.remove({_id:this.log_id}, async(err) => {
            if (err){
                reject(err);
            }else{
                await ActionExecution.deleteOne({_id:this._id})
                resolve('deleted log')
            } 
        });
    })

}