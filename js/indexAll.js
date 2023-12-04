const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-table tbody');
const cartTotalAmount = document.querySelector('.js-cartTotalAmount');
const cartDelAllBtn = document.querySelector('.discardAllBtn');
const alartMsg = orderInfoForm.querySelectorAll('[data-message]');

let productData = [];

// initialize
function init(){
    getApiProductData();
    getApiCartData();
}

// Product - API - get all product data
function getApiProductData(){
    axios.get(`${customerUrl}/products`)
        .then(res => {
            productData = res.data.products
            renderProductList(productData);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Product - render product list
function renderProductList(data){
    productList.innerHTML = data.reduce((sum,item) => {
        return sum += 
        `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>`
    },'');
}

// Product - product list filter
function filterProductList(){
    // if selected '全部', render all data
    if(this.value === '全部'){
        renderProductList(productData);
        return
    }

    // filter selected category then render
    const filterproductData = productData.filter(({category}) => category === this.value);
    renderProductList(filterproductData);
}

// Cart - API - get all cart data
function getApiCartData(){
    axios.get(`${customerUrl}/carts`)
        .then(res => {
            renderCartList(res.data.carts,res.data.finalTotal);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Cart - render cart list
function renderCartList(data,totalAmount){
    cartList.innerHTML = data.reduce((sum,item) => {
        const itemProduct = item.product;
        return sum += 
        `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${itemProduct.images}" alt="">
                    <p>${itemProduct.title}</p>
                </div>
            </td>
            <td>NT$${itemProduct.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${itemProduct.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`
    },'');

    // update total amount
    cartTotalAmount.textContent = `NT$${totalAmount}`;
}

// Cart - add product to cart
function addProductToCart(event){
    event.preventDefault();

    // check if click on addCardBtn
    if(event.target.getAttribute('class') !== 'addCardBtn') return;
    postApiCartItem(event.target.dataset.id);
}

// Cart - API - post to carts
function postApiCartItem(id){
    const itemObj = {
        "data": {
            "productId": id,
            "quantity": 1
        }
    }

    axios.post(`${customerUrl}/carts`,itemObj)
        .then(res => {
            renderCartList(res.data.carts,res.data.finalTotal);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Cart - delete one item from cart
function delCartItem(event){
    event.preventDefault();

    // check if click on discardBtn > a 
    if(event.target.parentNode.className !== 'discardBtn') return;
    const id  = event.target.dataset.id;
    delApiCartItem(id);
}

// Cart - API - delete cart one item
function delApiCartItem(id){
    axios.delete(`${customerUrl}/carts/${id}`)
        .then(res => {
            renderCartList(res.data.carts,res.data.finalTotal);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Cart - delet all item from cart
function delCartAll(event){
    event.preventDefault();
    delApiCartAll();
}

// Cart - API - delete cart all item
function delApiCartAll(){
    axios.delete(`${customerUrl}/carts`)
        .then(res => {
            renderCartList(res.data.carts,res.data.finalTotal);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Order - get form information and send order to server
function addOrder(event){
    event.preventDefault();

    // clear all alert message
    alartMsg.forEach(item => item.textContent = '');
    // validate form - if info is wrong, show alert message
    const isAlert = validateForm();
    if(isAlert){
        Object.keys(isAlert).forEach(item => {
            const alertElement = orderInfoForm.querySelector(`[data-message="${item}"]`)
            const alertMsg = isAlert[item].toString();
            alertElement.textContent = alertMsg;
        })
        return
    }

    // if info is okay, put all info into a obj, then send post to server
    const inputs = this.querySelectorAll('.orderInfo-input');
    const orderInfo = {};
    inputs.forEach(input => orderInfo[input.dataset.inputkey] = input.value);
    postApiOrder(orderInfo);

    // reset form after submitting it successfully
    orderInfoForm.reset();
}


// Order - API - post order info to server
function postApiOrder(info){
    const itemObj = {
        "data": {
            "user": info
        }
    }

    axios.post(`${customerUrl}/orders`,itemObj)
        .then(res => {
            alert(`訂單已成功送出！\n訂單編號：${res.data.id}`);
            renderCartList([],0);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Order - validate form
function validateForm(){
    const constraints = {
        "姓名": {
            presence: {
                message: "是必填欄位!"
            }
        },
        "電話": {
            presence: {
                message: "是必填欄位!"
            },
            length: {
                minimum: 8,
                message: "號碼需超過 8 碼!"
            }
        },
        "Email": {
            presence: {
                message: "是必填欄位!"
            },
            email: {
                message: "格式有誤!"
            }
        },
        "寄送地址": {
            presence: {
                message: "是必填欄位!"
            }
        }
    };

    return validate(orderInfoForm, constraints);
}

productSelect.addEventListener('change',filterProductList);
productList.addEventListener('click',addProductToCart);
cartList.addEventListener('click',delCartItem);
cartDelAllBtn.addEventListener('click',delCartAll);
orderInfoForm.addEventListener('submit',addOrder);
init();
