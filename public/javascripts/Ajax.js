const { post } = require("../../routes/user")

// this fn is for implementing ajax for incrementing product count in home page
function addToCart(productId){
    $.ajax({
        url:"/add-to-cart/"+productId,
        method:"get",// since submitted through url
        success:(response)=>{
            console.log(response)
            if(response.success){
                let quantity =  parseInt($("#cartProductsCount").html())
                // console.log(quantity)
                // getting the no of products in user cart and adding one more to it
                $("#cartProductsCount").html(quantity+1)
                console.log("Ajax worked for incrementing count ")
            }
            else{
                console.log("Product added to cart but count not updated")
            }
        }
    })
}

// fn for incrementing quantity in cart page
function changeQuantity(cartId,productId,operation){
    // elementId is id for quantity for each product inside cart
    elementId = "#"+productId
    let quantity = parseInt($(elementId).html())
    if(quantity<2) $('#decrementBtn'+productId).prop("disabled", true);
    $.ajax({
        url:"/change-product-quantity",
        data: { 
            cartId:cartId,
            productId:productId,
            op:operation   
        },
        type:"post", /** method type */
        success:(response)=>{
            if(response.success){
                quantity = quantity+response.count
                $(elementId).html(quantity)
                if(quantity<2) $('#decrementBtn'+productId).prop("disabled", true);
                else $('#decrementBtn'+productId).removeAttr('disabled')
            }
        }
    })
}

//fn for removing product from cart
function removeCartProduct(cId,pId) {
    elementId = "#row"+pId // since jquery is used "#" is used for giving a hint that it is id
    console.log(elementId)
    // document.getElementById("row"+pId).style.display = "none" // hiding the table row with product after removal of product from cart
    // $(elementId).hide()    
    $.ajax({
        url:"/remove-cart-product",
        data:{
            cartId:cId,
            productId:pId
        },
        type:'post', /** method type */
        success:(response)=>{
            if(response.success){
                console.log("ajax was successful")
                alert("Product deleted successfully")
                location.reload() // alternative for $(elementId).hide()  
            }
        }
    })
}

// fn for default login
function defaultLogin(){
    let d = { email: 'abc@gmail.com', password: 'abc' }
    // { email: 'abc@gmail.com', password: 'abc' };
    $.ajax({
        url:"/login",
        data:d,
        type:'post',
        success:(response)=>{
            if(response){
            console.log("status is "+response)
            // alert("Default l ogin sucess")
            location.reload()
            }
        }
    })
}