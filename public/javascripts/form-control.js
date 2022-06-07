/**
 * this js file is written for controlling form visiblity in view-products
 */

productAddForm = document.getElementById("addProductForm")
// document.getElementById("addProductForm").style.display = "none"
productAddForm.style.display = "none"

productAddBtn = document.getElementById("addProductBtn")
productAddBtn.addEventListener("click",()=>{
    if (productAddBtn.textContent == "Add Product") {
        productAddBtn.textContent = "Done"
        productAddForm.style.display = "block"
    }
    else{
        productAddBtn.textContent = "Add Product"
        productAddForm.style.display = "none"
    }
})
// console.log(document.getElementById("addProductBtn").textContent)