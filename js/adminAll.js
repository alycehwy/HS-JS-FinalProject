const orderList = document.querySelector('.orderPage-table tbody');
const discardAllBtn = document.querySelector('.discardAllBtn');

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
            renderC3Chart(res.data.orders);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Order - render order list
function renderOrderList(data){
    // data sort by time
    data.sort((a,b) => b.createdAt - a.createdAt);

    orderList.innerHTML = data.reduce((sum,item) => {
        const orderDate = new Date(item.createdAt * 1000).toLocaleDateString('en-ZA');
        const productItems = item.products.reduce((sum,item) => {
            return sum + `<p>${item.title} * ${item.quantity}</p>`
        },'')
        return sum + 
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
                <a href="#" class="js-orderStatus-Btn" data-id="${item.id}" data-status="${item.paid}">${item.paid ? '已處理' : '未處理'}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
    },'');
}

// Order - modify order status
function modifyOrderStatus(event){
    event.preventDefault();

    // check if click on js-orderStatus-Btn
    if(event.target.getAttribute('class') !== 'js-orderStatus-Btn') return;
    const id =  event.target.dataset.id;
    const status = event.target.dataset.status === 'true' ;
    putApiOrderStatus(id,status);
}

// Order - API - (PUT)modify order status
function putApiOrderStatus(id,status){
    const itemObj = {
        "data": {
            "id": id,
            "paid": !status
        }
    };

    axios.put(`${adminUrl}/orders`,itemObj,auth)
        .then(res => {
            renderOrderList(res.data.orders);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Order - delete one item from order
function delOrderItem(event){
    event.preventDefault();

    // check if click on delSingleOrder-Btn
    if(event.target.getAttribute('class') !== 'delSingleOrder-Btn') return;
    const id  = event.target.dataset.id;
    delApiOrderItem(id);
}

// Order - API - delete order one item
function delApiOrderItem(id){
    axios.delete(`${adminUrl}/orders/${id}`,auth)
        .then(res => {
            renderOrderList(res.data.orders);
            renderC3Chart(res.data.orders);
            alert(`已成功刪除訂單：${id}`);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Order - delet all item from order
function delOrderAll(event){
    event.preventDefault();
    delApiOrderAll();
}

// Order - API - delete order all item
function delApiOrderAll(){
    axios.delete(`${adminUrl}/orders`,auth)
        .then(res => {
            renderOrderList([]);
            renderC3Chart([])
            alert(`已成功刪除全部訂單！`);
        })
        .catch(err => console.error(err.response.data.message || err.message));
}

// Order - get C3 chart data
function getC3Data(data){
    const incomeObj = {};
    // get each product's income
    data.forEach(({products}) => {
        products.forEach(item => {
            !incomeObj[item.title] ? incomeObj[item.title] = item.price * item.quantity : incomeObj[item.title] += item.price * item.quantity;
        });
    });

    // sort the income
    const sortByIncome = Object.keys(incomeObj).sort((a,b) => incomeObj[b] - incomeObj[a]);

    // convert data format for C3 chart
    const dataToC3 = [];
    let otherIncomeSum = 0;
    // if income items > 3, need to sum the rest item's income
    sortByIncome.forEach((item,idx) => {
        if(idx < 3){
            dataToC3.push([item,incomeObj[item]]);
        }else{
            otherIncomeSum += incomeObj[item];
        }
    });
    if(otherIncomeSum !== 0){
        dataToC3.push(['其他',otherIncomeSum]);
    }
    
    return dataToC3;
}

// Order - render C3 chart
function renderC3Chart(data){
    const chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: getC3Data(data)            
        },
        color: {
            pattern: ['#301E5F','#5434A7','#9D7FEA','#DACBFF']
        },
        
    });
}

orderList.addEventListener('click',modifyOrderStatus);
orderList.addEventListener('click',delOrderItem);
discardAllBtn.addEventListener('click',delOrderAll);
init();