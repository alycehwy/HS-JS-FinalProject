const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-table tbody');
const shoppingCartTable = document.querySelector('.shoppingCart-table');
const shoppingCartEmpty = document.querySelector('.shoppingCart-empty');
const cartTotalAmount = document.querySelector('.js-cartTotalAmount');
const cartDelAllBtn = document.querySelector('.discardAllBtn');
const alartMsg = orderInfoForm.querySelectorAll('[data-message]');

let productData = [];
let cartData = [];

// initialize
function init(){
    getApiProductData();
    getApiCartData();
}

// Product - API - get all product data
function getApiProductData(){
    axios.get(`${customerUrl}/products`)
        .then(res => {
            productData = res.data.products;
            renderProductCategoryOption(productData);
            renderProductList(productData);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Product - render product categoty option
function renderProductCategoryOption(data){
    // use Set to get category items => Each value can only occur once in a Set
    const categorySet = new Set();
    data.forEach(({category}) => categorySet.add(category));

    // convert data to array to use the array method to build html structure
    const categoryList = [...categorySet];
    categoryList.unshift('全部');

    // productSelect option structure
    productSelect.innerHTML = categoryList.reduce((sum,item) => {
        return sum += `<option value="${item}">${item}</option>`
    },'');
    
    // make sure '全部' is default selected
    productSelect.querySelector(`[value="全部"]`).setAttribute('selected','');
}

// Product - render product list
function renderProductList(data){
    // create purchaseQty option html structure
    let purchaseQtyOption = '';
    for(let i = 1; i <= 10; i++){
        purchaseQtyOption += `<option value="${i}">${i}</option>`;
    }

    // productList structure
    productList.innerHTML = data.reduce((sum,item) => {
        return sum += 
        `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="${item.title}">
            <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
            <div class="purchaseQty-box">
                <label for="purchaseQty">購買數量:</label>
                <select name="purchaseQty" id="purchaseQty" class="purchaseQty">
                    ${purchaseQtyOption}
                </select>
            </div>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${thousandsComma(item.origin_price)}</del>
            <p class="nowPrice">NT$${thousandsComma(item.price)}</p>
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
            cartData = res.data.carts;
            renderCartList(cartData,res.data.finalTotal);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Cart - render cart list
function renderCartList(data,totalAmount){
    // if cart is empty, show cart empty's img, hide cart list
    if(data.length === 0){
        shoppingCartEmpty.classList.remove('hide');
        shoppingCartTable.classList.add('hide');
        return
    }

    // if cart is not empty, hide cart empty's img, show cart list, and bulid the cart list
    shoppingCartEmpty.classList.add('hide');
    shoppingCartTable.classList.remove('hide');
    cartList.innerHTML = data.reduce((sum,item) => {
        const itemProduct = item.product;
        return sum += 
        `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${itemProduct.images}" alt=${itemProduct.title}">
                    <p>${itemProduct.title}</p>
                </div>
            </td>
            <td>NT$${thousandsComma(itemProduct.price)}</td>
            <td class="cardItem-quantity">
                <div>
                    <a href="#" class="material-icons" data-action="minus" data-id="${item.id}" data-qty="${item.quantity}">remove</a>
                    <span>${item.quantity}</span>
                    <a href="#" class="material-icons" data-action="plus" data-id="${item.id}" data-qty="${item.quantity}">add</a>
                </div>
            </td>
            <td>NT$${thousandsComma(itemProduct.price * item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`
    },'');

    // update total amount
    cartTotalAmount.textContent = `NT$${thousandsComma(totalAmount)}`;
}

// Cart - add product to cart
function addProductToCart(event){
    event.preventDefault();

    // check if click on addCardBtn
    if(event.target.getAttribute('class') !== 'addCardBtn') return;

    const id = event.target.dataset.id;
    const productCard = event.target.parentNode;
    const productQty = productCard.querySelector('.purchaseQty').value;
    postApiCartItem(id,productQty);
}

// Cart - API - post to carts
function postApiCartItem(id,qty){
    const itemObj = {
        "data": {
            "productId": id,
            "quantity": Number(qty)
        }
    }
    
    axios.post(`${customerUrl}/carts`,itemObj)
        .then(res => {
            cartData = res.data.carts;
            renderCartList(cartData,res.data.finalTotal);
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
            cartData = res.data.carts;
            renderCartList(cartData,res.data.finalTotal);
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
            cartData = [];
            renderCartList([],0);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Cart - modify the quantity for product item
function modifyCartItemQty(event){
    event.preventDefault();

    // check if click on cardItem-quantity btn
    if(!event.target.getAttribute('data-action')) return;

    const id = event.target.dataset.id;
    let qty = event.target.dataset.qty;
    event.target.dataset.action === 'plus' ? qty++ : qty-- ;
    // if qty is 0 => delete item
    // if not patch api for modify quantity and re-render cart list
    qty === 0 ? delApiCartItem(id) : patchApiQty(id,qty);
}

// Cart - API - patch for cart item's quantity
function patchApiQty(id,qty){
    const itemObj = {
        "data": {
            "id": id,
            "quantity": Number(qty)
        }
    }

    axios.patch(`${customerUrl}/carts`,itemObj)
        .then(res => {
            cartData = res.data.carts;
            renderCartList(cartData,res.data.finalTotal);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Order - get form information and send order to server
function addOrder(event){
    event.preventDefault();

    // check if cartData is empty
    if(cartData.length === 0){
        alert('你的購物車空空的，先去選購吧！');
        return
    }

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

// for amount displays thousand comma
function thousandsComma(num){
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

productSelect.addEventListener('change',filterProductList);
productList.addEventListener('click',addProductToCart);
cartList.addEventListener('click',delCartItem);
cartList.addEventListener('click',modifyCartItemQty);
cartDelAllBtn.addEventListener('click',delCartAll);
orderInfoForm.addEventListener('submit',addOrder);
init();
