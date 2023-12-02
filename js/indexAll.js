const productList = document.querySelector('.productWrap');

// initialize
function init(){
    getApiProductData();
}

// get all product data from API
function getApiProductData(){
    axios.get(`${customerUrl}/products`)
        .then(res => {
            renderProductList(res.data.products);
        })
        .catch(err => console.error(err.response.data.message))
}

// render product list
function renderProductList(data){
    productList.innerHTML = data.reduce((sum,item) => {
        return sum += 
        `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>`
    },'');
    
}

init();
