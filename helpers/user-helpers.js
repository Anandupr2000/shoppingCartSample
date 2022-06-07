// connecting to db before doing any db related queries
var db = require('../config/dbConnect')
var collections = require('../config/collections')
const config = require('../config/collections')
var ObjectId = require("mongodb").ObjectId

const bcrypt = require('bcrypt')

module.exports = {
    // fn for storing data submitted through signup form
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            // bcrypt can be used to encrypt user password
            ////if the fn is not async
            // userData.password = bcrypt.hash(userData.password,10,(err, data) =>{
            //     db.get().collection(collections.USER_COLLECTION)
            // }) 
            //Second argument is salt, to be used in encryption.
            //If specified as a number then a salt will be generated with the specified number of 
            //rounds and used.
            // console.log("password got is => "+userData.password)
            userData.password = await bcrypt.hash(userData.password, 10) // wait untill hash value is produced
            // console.log("password after hashing is => "+userData.password)
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data) // return of promise
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            // resolve is used for returning response and reject for rejecting request by producing an error message of string passed when calling

            let loginStatus = false
            let response = {}
            // checking user based on email
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
            // if user found with email
            if (user) {
                // bcrypt.compare() is also a promise fn
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("Login sucess")
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log("Login failed")
                        // returning object status inside response like object , with only one key-value pair 
                        resolve({ status: false })
                    }
                })
            }
            else {//if no user found with email
                console.log("No user found with " + userData.email)
                // returning object status inside response like object , with only one key-value pair
                resolve({ status: false })
            }
        })
    },
    findUser: (id) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(id) })
            console.log(user)
            resolve(user)
        })
    },
    addToCart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            /**
             * check the user cart empty or not
             * if cart is empty then create a new cart
             * else update cart by adding product to existing cart list
             */

            //retriving userCart if present
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: ObjectId(userId) })

            // var productId = ObjectId(productId)
            // var userId = ObjectId(userId)
            
            /**
             * creating a new product object and setting its count as 1 since its first selection
             */

            let productObj = { 
                item:ObjectId(productId),
                quantity:1
            } 
            /**
             * user cart is present
             */
            if (userCart) {
                console.log("user cart found")
                console.log(userCart)
                /** 
                 * finding product from cart array for incremnting count of it
                 * it uses loop such eg: for each
                 * product is the variable used to iterate over each element in the cart array 
                 * each item's ObjectId is accessed by product.item
                 * pExist is a variable used to store index value of product if present
                 */
                let pExist = userCart.product.findIndex(product=>product.item == productId)
                console.log(pExist)

                if(pExist!=-1){
                    // if pExist not equal to 0, then product is present in cart and increment quantity
                    db.get().collection(collections.CART_COLLECTION)
                    .updateOne(
                        {
                            // searches for item untill it is matched with productId
                            user:ObjectId(userId),'product.item':ObjectId(productId)
                        },
                        {
                            // incrementing quantity for that product by 1
                            $inc:{'product.$.quantity':1} // since its array we have to put $
                        }
                    ).then(()=>{
                        resolve()
                    })
                }
                else{
                // adding different product to cart 
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ user:  ObjectId(userId) }, {

                        // pushing product to cart array
                        $push: { product: productObj }

                    }).then((response) => {
                        resolve()
                    })
                }
            }
            /**
             * creating new cart and adding items to it
             */
            else {
                // let cartObj = {
                //     userId:[productId] // will not store in given logic format
                // }
                let cartObj = {
                    user: ObjectId(userId), // adding user id
                    product: [productObj] // creating array of user selected product's id
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj)
                    .then((response) => { resolve(response) })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                // first stage for finding specific documents
                {
                    $match: {user:ObjectId(userId)}
                },
                {
                    // unwinding is used for returning the details of the each products form products collection
                    // product is the name of object of user's selected items
                    $unwind:'$product'
                },
                {
                    // grouping required items and quantity from above unwinded array
                    $project: {
                        item:"$product.item",
                        quantity:"$product.quantity"
                    }
                },
                {
                    // lookup always returns a array of items
                    // lookup is here done to gather details of products
                    $lookup:{
                        //specify next collection to lookup
                        from:collections.PRODUCT_COLLECTION,
                        // specifying local key from project
                        localField:"item",
                        // specifying foreign key from PRODUCT_COLLECTION for which the value is same as localField
                        foreignField:"_id",
                        // storing 
                        as:"productDetails" // name of field
                    }
                },
                {
                    // converting array from lookup to object
                    $project:{
                        // 1- for including items from previous step, 0 for not including 
                        item:1,quantity:1,
                        // taking the details of product from first index of productDetails from previous step
                        product: {$arrayElemAt:['$productDetails',0]}
                    }
                }
                // second stage for looking for values in next document
                // {
                //     $lookup:{
                //         //specify next collection to lookup
                //         from:collections.PRODUCT_COLLECTION,
                //         //specify key
                //         let:{productList:"$product"},
                //         pipeline is for condition checking
                //         pipeline:[
                //             {
                //                 // new object containing details of product added to cart is included using below matching
                //                 $match:{
                //                     // all such expression satisfing is combined to another object and returned
                //                     $expr:{
                //                         // in is used for searching 1st argument in 2nd array
                //                         $in:['$_id',"$$productList"]
                //                     }
                //                 }
                //             }
                //         ],
                //         //returning cart items for that specific user 
                //         as:"cartItems"
                //     }
                // }
            ]).toArray()
            // productdetails
            // console.log(cartItems.length)
            // console.log(cartItems[0].productDetails[0])
            // console.log(cartItems[0].product)
            // checking whether items is present in cart
            if(cartItems) 
            resolve(cartItems)// returning cart products
            else resolve({})//returning empty object if no cartitems 
        })
    },
    // getCartProductsQuantity:(userId)=>{
    //     let cartCount = await db.get().collection(collections.CART_COLLECTION).aggregate([])
    
    // }
    // ,
    changeProductQuantity:(productDetails)=>{
        // console.log("inside changeProductQuantity function")
        // console.log(cartId,productId, op)
        // console.log(productDetails)
        return new Promise((resolve, reject) => {
            // if(productDetails)
            db.get().collection(collections.CART_COLLECTION)
                .updateOne(
                    {   _id:ObjectId(productDetails.cartId),
                        'product.item':ObjectId(productDetails.productId)
                    },
                    {
                        // $inc:{"valuetoBeIncremented":incrementValue}
                        $inc:{'product.$.quantity':productDetails.count} // since product is array, $ is used to access item within it
                    }
                ).then((response)=>{
                    console.log(response)
                    resolve(response)//returning response
                })
        })
    },
    removeCartProduct:(cart)=>{
        return new Promise((resolve, reject) => {
            console.log(cart)
            db.get().collection(collections.CART_COLLECTION)
                    .updateOne(
                        { 
                            _id:  ObjectId(cart.cartId)
                        }, 
                        {
                            // $pull: { deleteCondition }
                            // pushing product to cart array
                            $pull: {
                                // product is name of array
                                product:{ item:ObjectId(cart.productId)}
                                // 'item':ObjectId(cart.productId)
                            }
                        })
                    .then((response) => {
                        resolve(response)
                    })
        })
    }
}
