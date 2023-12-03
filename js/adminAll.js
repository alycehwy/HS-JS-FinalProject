const orderList = document.querySelector('.orderPage-table tbody');

const auth = {
    headers: {
        'Authorization': token
    }
};

// initialize
function init(){
    getApiOrderData();
}

// Order - API - get all order data
function getApiOrderData(){
    axios.get(`${adminUrl}/orders`,auth)
        .then(res => {
            renderOrderList(res.data.orders);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Order - render order list
function renderOrderList(data){
    orderList.innerHTML = data.reduce((sum,item) => {
        const orderDate = new Date(item.createdAt * 1000).toLocaleDateString('en-ZA');
        const productItems = item.products.reduce((sum,item) => {
            return sum += `<p>${item.title} * ${item.quantity}</p>`
        },'')
        return sum += 
        `<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>${productItems}</td>
            <td>${orderDate}</td>
            <td class="orderStatus">
                <a href="#" data-id="${item.id}" data-status="${item.paid}">${item.paid ? '已處理' : '未處理'}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除">
            </td>
        </tr>`
    },'');
}

// Order - modify order status
function modifyOrderStatus(event){
    event.preventDefault();

    const id =  event.target.dataset.id;
    const status = event.target.dataset.status === 'true' ;
    if(!id) return;
    putApiOrderStatus(id,status);
}

// Order - API - (PUT)modify order status
function putApiOrderStatus(id,status){
    const itemObj = {
        "data": {
            "id": id,
            "paid": !status
        }
    }

    axios.put(`${adminUrl}/orders`,itemObj,auth)
        .then(res => {
            renderOrderList(res.data.orders);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

orderList.addEventListener('click',modifyOrderStatus);
init();

// C3.js
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: [
        ['Louvre 雙人床架', 1],
        ['Antony 雙人床架', 2],
        ['Anty 雙人床架', 3],
        ['其他', 4],
        ],
        colors:{
            "Louvre 雙人床架":"#DACBFF",
            "Antony 雙人床架":"#9D7FEA",
            "Anty 雙人床架": "#5434A7",
            "其他": "#301E5F",
        }
    },
});