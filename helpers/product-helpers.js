var db = require('../config/dbConnect') 
const collection = require('../config/collections')
var objectId = require("mongodb").ObjectId

module.exports  = {
    addProduct:(product,callback)=>{
        // console.log(product) 
        // here we call get() only since db is already connected before this
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            // console.log("Id of data => ")
            // console.log(data.insertedId)
            callback(data.insertedId)
            // callback(data.ops[0]._id) // returning id of the product for naming it as id
        })
    },
    getProductDetails:(productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)})
            .then((product) => {
                resolve(product);
            })
        })
    },
    getAllProducts:() => { // using promise to return objects from database
        return new Promise(async (resolve, reject) => {
            // wait untill all products are fetched from database
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products) // returning products only after await fn executed
        })
    },
    deleteProduct:(productId) =>{
        return new Promise((resolve, reject) =>{
            db.get().collection(collection.PRODUCT_COLLECTION).remove({_id:objectId(productId)}).then(
                (response) =>{
                    console.log(response)
                    resolve(response);
                }
            )
        })
    },
    updateProduct:(productDetails)=>{
        return new Promise((resolve, reject) =>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(productDetails._id)},{
                $set:{
                    Name:productDetails.Name,
                    Price:productDetails.Price,
                    Description:productDetails.Description,
                    Category:productDetails.Category
                }
            }).then((response)=>{
                resolve(response)//returning response
            })
        })
    }
}