const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-table tbody');

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
            renderCartList(res.data.carts);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Cart - render cart list
function renderCartList(data){
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
                <a href="#" class="material-icons">
                    clear
                </a>
            </td>
        </tr>`
    },'');
}

// Cart - add product to cart
function addProductToCart(event){
    event.preventDefault();

    if(event.target.getAttribute('class') !== 'addCardBtn'){
        return
    }

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
        renderCartList(res.data.carts);
    })
    .catch(err => console.error(err.response.data.message || err.message));
}


productSelect.addEventListener('change',filterProductList);
productList.addEventListener('click',addProductToCart);
init();
