var express = require('express');
var router = express.Router();

// importing all fn in product-helpers as object
var productHelpers = require("../helpers/product-helpers")
// importing collection name in colection.js
/* GET admin listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with resource') //sending message
  res.render('admin/home',{admin:true}); // rendering hbs file with admin value true
});

router.get('/products',(req, res, next) => {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{products,admin:true}); // rendering hbs file with admin value true
  })
})

// for giving form file as response
router.get('/addProducts',(req,res)=>{
  res.render('admin/addProducts',{admin:true})
})

//collecting response submited in post
router.post('/addProducts',(req,res, next)=>{
  
// productHelpers contains all fn exported from product-helpers.js file
  productHelpers.addProduct(req.body,
    // starting callbackfn
    (id)=>{ // id returned from addProduct
    let image = req.files.Image // gets image(Image is name of file input field)
    //mv() fn is from fileupload library
    image.mv("./public/product_images/"+id+".jpg",(err,done)=>{
      // if no error render response page
      if(err){
        console.log("Error storing file : "+err)
      }
      else{
        res.render("admin/addProducts",{admin:true,inserted:true,product:req.body.Name})
      }
    })
  })  
  //end of callbackfn
})

//  for deleting
// in method 1
router.get("/delete-product/:id",(req, res) => {

  // in method 2
// router.get("/delete-product",(req, res) => {

  // method 1 for getting data 
  let productId = req.params.id
  console.log(productId)
  // // method 2 for getting data
  // console.log(req.query.id)
  // console.log(req.query.name)

  productHelpers.deleteProduct(productId).then(
    (response) => {
      res.redirect("/admin/products")
    })
})

// for updating
router.get('/edit-product/:id', async (req, res)=>{
  let product = await productHelpers.getProductDetails(req.params.id)
  // console.log(product)
  res.render("admin/edit-product",{admin:true,product})
})
router.post('/edit-product',(req, res)=>{
  // console.log(req.body)
  productHelpers.updateProduct(req.body)
  .then( // after updating redirect the admin to view-product
    ()=>{
      /**
       * the file size is small therefore we redirect client first before uploading image file
       * if file is large, then a progress must be shown and user is redirected only after uploading
       */ 
      res.redirect("/admin/products")
      if(req.files){ // there is files selected
        let image = req.files.Image 
        image.mv("./public/product_images/"+req.body._id+".jpg")
      }
  })
})
module.exports = router;
