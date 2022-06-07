var express = require('express');
var router = express.Router();
// importing all fn in product-helpers as object
const productHelpers = require("../helpers/product-helpers")
const userHelpers = require("../helpers/user-helpers")

// checking validity of user
const verifyLogIn = (req, res, next) => {
  if (req.session.loggedIn) {
    next()// if the user has account then continue with next step
  }
  else {
    res.redirect("/login")
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  //checking session in server
  let user = req.session.user // returns undefined value when created session for that client expired 
  // console.log("user is => ")
  // console.log(user)
  productHelpers.getAllProducts().then(async (products) => {
    // console.log(products)
    if (user) {
      // getting no of items in cart for logged in user
      // console.log(await userHelpers.getCartProducts(user._id))
      let cartProductsCount = 0
      let cartProductsTypes = ((await userHelpers.getCartProducts(user._id)))
      cartProductsTypes.forEach(element => {
        cartProductsCount += element.quantity
      });
      console.log(cartProductsCount)

        res.render('users/view-products', { products, user, cartProductsCount }); // passing product as well as user logged-in value 

    }
    else {
      res.render('users/view-products', { products });
    }
  })
});

// giving user login page
router.get('/login', (req, res) => {
  // console.log("request received is => ")
  // console.log(req)
  if (req.session.loggedIn) res.redirect("/") // if once logged in goto home page instead showing login page
  else {
    // req.session.logInErr is for showing invalid username or password 
    res.render('users/login', { "logInErr": req.session.logInErr })
    req.session.logInErr = false // set value to false since error is informed
  }
})
// getting data from login form
router.post('/login', (req, res) => {
  // console.log(req.body)
  userHelpers.doLogin(req.body)//passing form data as json
    .then((response) => {
      if (response.status) {
        // after sucessfull login a session is created for that users
        req.session.loggedIn = true
        //saving user data
        req.session.user = response.user // user returned from doLogin() fn's response obj  
        // redirecting user to homepage instead of rendering new page for user
        res.redirect("/")
      } else {
        req.session.logInErr = "Invalid username or password"
        res.redirect("/login") //redirecting to login page if login failed
      }
    })
})

//test for displaying current session
// router.get("/session",(req,res)=>{
//   res.send(req.session)
// })

// loging out
router.get("/logout", (req, res) => {
  console.log("session of user is => ")
  console.log(req.session)
  req.session.destroy() // destroying session for that user
  res.redirect("/")
})

// giving user signup page
router.get('/signup', (req, res) => {
  res.render('users/signup')
})

//creating new user
router.post("/signup", // getting form data submitted through post method
  (req, res) => {
    //since a promise is returned from doSignup fn we use signup
    userHelpers.doSignup(req.body).then((response) => {
      // console.log("response is => ")
      // console.log(response)
      // res.send("user inserted..")
      // //saving user data
      userHelpers.findUser(response.insertedId).then(
        (user) => {
          console.log(user)
          req.session.user = user
          req.session.loggedIn = true
          res.redirect("/")
        })
    })
  }
)

// perform below operation only if user has session  
router.get("/cart", verifyLogIn, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)
  // console.log(products.quantity)
  res.render("users/cart", { products, user: req.session.user})
})

router.get("/add-to-cart/:id", verifyLogIn, (req, res) => {
  console.log("\n\napi call\n")
  // passing product id and user id for creating an array of products choosed by user
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => { 
    //res.redirect("/") 
    res.json({success:true})// giving response status for adding item to cart as true
  })
})

router.post('/change-product-quantity',(req, res, next)=>{
  if(req.body.op=="+"){
    req.body.count = 1
  }
  else if(req.body.op=="-"){
    req.body.count = -1
  }
  else{
    req.body.count = 0
  }
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    console.log(response)

    //adding success and count to response object
    response.success = true
    response.count = req.body.count
    res.json(response)
  })
})

router.post("/remove-cart-product",(req, res)=>{
  // console.log(req.body)
  userHelpers.removeCartProduct(req.body).then((response)=>{
    response.success = true
    console.log(response)
    res.json(response)
  })
})
router.get("/place-order",(req, res)=>{
  res.render("users/place-order")
})
module.exports = router;
