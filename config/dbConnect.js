const mongoClient = require('mongodb').MongoClient
const state = {
    db:null
}
module.exports.connect = function(done){
    const url = 'mongodb://localhost:27017'
    const dbname = 'shopping'
    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)    // returning error object on failed connection to called line through callback
        state.db = data.db(dbname)
        done()
    })
}

module.exports.get = ()=>{return state.db}