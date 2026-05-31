const API_BASE = '/api';

let products = [];

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

async function apiRequest(url, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        const response = await fetch(API_BASE + url, options);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Request failed');
        }
        return result;
    } catch (error) {
        showToast(error.message, true);
        throw error;
    }
}

function formatCurrency(amount) {
    return '¥' + parseFloat(amount).toFixed(2);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.page).classList.add('active');
        
        if (btn.dataset.page === 'dashboard') loadDashboard();
        if (btn.dataset.page === 'purchase') { loadProductsForSelect(); loadPurchases(); }
        if (btn.dataset.page === 'sale') { loadProductsForSelect(); loadSales(); }
        if (btn.dataset.page === 'inventory') { loadCategories(); loadProducts(); }
        if (btn.dataset.page === 'warning') loadLowStock();
        if (btn.dataset.page === 'stats') loadMonthlyStats();
    });
});

async function loadDashboard() {
    try {
        const overview = await apiRequest('/stats/overview');
        document.getElementById('totalProducts').textContent = overview.total_products;
        document.getElementById('lowStockCount').textContent = overview.low_stock_count;
        document.getElementById('totalSales').textContent = formatCurrency(overview.total_sales);
        document.getElementById('totalSaleCount').textContent = overview.total_sale_count;
        
        const sales = await apiRequest('/sales');
        const recentSales = sales.slice(0, 10);
        const tbody = document.querySelector('#recentSalesTable tbody');
        if (recentSales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">暂无销售记录</td></tr>';
            return;
        }
        tbody.innerHTML = recentSales.map(s => `
            <tr>
                <td>${s.product.name}</td>
                <td>${s.quantity} ${s.product.unit}</td>
                <td>${formatCurrency(s.unit_price)}</td>
                <td>${formatCurrency(s.total_amount)}</td>
                <td>${formatDate(s.created_at)}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function loadProductsForSelect() {
    try {
        products = await apiRequest('/products');
        const purchaseSelect = document.getElementById('purchaseProduct');
        const saleSelect = document.getElementById('saleProduct');
        
        purchaseSelect.innerHTML = '<option value="">请选择商品</option>' + 
            products.map(p => `<option value="${p.id}" data-price="${p.purchase_price}" data-supplier="${p.supplier}">${p.name}</option>`).join('');
        
        saleSelect.innerHTML = '<option value="">请选择商品</option>' + 
            products.map(p => `<option value="${p.id}" data-price="${p.retail_price}" data-stock="${p.stock}">${p.name} (库存: ${p.stock})</option>`).join('');
    } catch (e) {
        console.error(e);
    }
}

async function loadCategories() {
    try {
        const categories = await apiRequest('/products/categories');
        const select = document.getElementById('productCategoryFilter');
        select.innerHTML = '<option value="all">全部</option>' + 
            categories.map(c => `<option value="${c}">${c}</option>`).join('');
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('purchaseProduct').addEventListener('change', function() {
    const option = this.options[this.selectedIndex];
    if (option.value) {
        document.getElementById('purchasePrice').value = option.dataset.price;
        document.getElementById('purchaseSupplier').value = option.dataset.supplier;
    }
    calculatePurchaseTotal();
});

document.getElementById('purchaseQuantity').addEventListener('input', calculatePurchaseTotal);
document.getElementById('purchasePrice').addEventListener('input', calculatePurchaseTotal);

function calculatePurchaseTotal() {
    const qty = parseFloat(document.getElementById('purchaseQuantity').value) || 0;
    const price = parseFloat(document.getElementById('purchasePrice').value) || 0;
    document.getElementById('purchaseTotal').textContent = formatCurrency(qty * price);
}

document.getElementById('purchaseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const productId = document.getElementById('purchaseProduct').value;
    if (!productId) {
        showToast('请选择商品', true);
        return;
    }
    
    try {
        await apiRequest('/purchases', 'POST', {
            product_id: parseInt(productId),
            quantity: parseFloat(document.getElementById('purchaseQuantity').value),
            unit_price: parseFloat(document.getElementById('purchasePrice').value),
            supplier: document.getElementById('purchaseSupplier').value,
            operator: document.getElementById('purchaseOperator').value,
            remark: document.getElementById('purchaseRemark').value
        });
        showToast('进货登记成功');
        this.reset();
        document.getElementById('purchaseTotal').textContent = '¥0.00';
        loadPurchases();
    } catch (e) {
        console.error(e);
    }
});

async function loadPurchases() {
    try {
        const startDate = document.getElementById('purchaseStartDate').value;
        const endDate = document.getElementById('purchaseEndDate').value;
        let url = '/purchases';
        const params = [];
        if (startDate) params.push('start_date=' + startDate);
        if (endDate) params.push('end_date=' + endDate);
        if (params.length) url += '?' + params.join('&');
        
        const purchases = await apiRequest(url);
        const tbody = document.querySelector('#purchaseTable tbody');
        if (purchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-message">暂无进货记录</td></tr>';
            return;
        }
        tbody.innerHTML = purchases.map(p => `
            <tr>
                <td>${p.product.name}</td>
                <td>${p.quantity} ${p.product.unit}</td>
                <td>${formatCurrency(p.unit_price)}</td>
                <td>${formatCurrency(p.total_amount)}</td>
                <td>${p.supplier || '-'}</td>
                <td>${p.operator || '-'}</td>
                <td>${formatDate(p.created_at)}</td>
                <td><button class="btn btn-danger" onclick="deletePurchase(${p.id})">删除</button></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function deletePurchase(id) {
    if (!confirm('确定要删除这条进货记录吗？')) return;
    try {
        await apiRequest('/purchases/' + id, 'DELETE');
        showToast('删除成功');
        loadPurchases();
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('saleProduct').addEventListener('change', function() {
    const option = this.options[this.selectedIndex];
    if (option.value) {
        document.getElementById('salePrice').value = option.dataset.price;
        document.getElementById('saleStock').value = option.dataset.stock;
    }
    calculateSaleTotal();
});

document.getElementById('saleQuantity').addEventListener('input', calculateSaleTotal);
document.getElementById('salePrice').addEventListener('input', calculateSaleTotal);

function calculateSaleTotal() {
    const qty = parseFloat(document.getElementById('saleQuantity').value) || 0;
    const price = parseFloat(document.getElementById('salePrice').value) || 0;
    document.getElementById('saleTotal').textContent = formatCurrency(qty * price);
}

document.getElementById('saleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const productId = document.getElementById('saleProduct').value;
    if (!productId) {
        showToast('请选择商品', true);
        return;
    }
    
    const stock = parseFloat(document.getElementById('saleStock').value);
    const qty = parseFloat(document.getElementById('saleQuantity').value);
    if (qty > stock) {
        showToast('库存不足', true);
        return;
    }
    
    try {
        await apiRequest('/sales', 'POST', {
            product_id: parseInt(productId),
            quantity: qty,
            unit_price: parseFloat(document.getElementById('salePrice').value),
            customer: document.getElementById('saleCustomer').value,
            operator: document.getElementById('saleOperator').value,
            remark: document.getElementById('saleRemark').value
        });
        showToast('销售记录成功');
        this.reset();
        document.getElementById('saleStock').value = '';
        document.getElementById('saleTotal').textContent = '¥0.00';
        loadSales();
    } catch (e) {
        console.error(e);
    }
});

async function loadSales() {
    try {
        const startDate = document.getElementById('saleStartDate').value;
        const endDate = document.getElementById('saleEndDate').value;
        let url = '/sales';
        const params = [];
        if (startDate) params.push('start_date=' + startDate);
        if (endDate) params.push('end_date=' + endDate);
        if (params.length) url += '?' + params.join('&');
        
        const sales = await apiRequest(url);
        const tbody = document.querySelector('#saleTable tbody');
        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-message">暂无销售记录</td></tr>';
            return;
        }
        tbody.innerHTML = sales.map(s => `
            <tr>
                <td>${s.product.name}</td>
                <td>${s.quantity} ${s.product.unit}</td>
                <td>${formatCurrency(s.unit_price)}</td>
                <td>${formatCurrency(s.total_amount)}</td>
                <td>${s.customer || '-'}</td>
                <td>${s.operator || '-'}</td>
                <td>${formatDate(s.created_at)}</td>
                <td><button class="btn btn-danger" onclick="deleteSale(${s.id})">删除</button></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function deleteSale(id) {
    if (!confirm('确定要删除这条销售记录吗？')) return;
    try {
        await apiRequest('/sales/' + id, 'DELETE');
        showToast('删除成功');
        loadSales();
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        await apiRequest('/products', 'POST', {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            unit: document.getElementById('productUnit').value,
            stock: parseFloat(document.getElementById('productStock').value),
            warning_stock: parseFloat(document.getElementById('productWarningStock').value),
            retail_price: parseFloat(document.getElementById('productRetailPrice').value),
            purchase_price: parseFloat(document.getElementById('productPurchasePrice').value),
            supplier: document.getElementById('productSupplier').value
        });
        showToast('商品添加成功');
        this.reset();
        document.getElementById('productStock').value = '0';
        document.getElementById('productWarningStock').value = '10';
        loadCategories();
        loadProducts();
    } catch (e) {
        console.error(e);
    }
});

async function loadProducts() {
    try {
        const category = document.getElementById('productCategoryFilter').value;
        const keyword = document.getElementById('productKeyword').value;
        let url = '/products';
        const params = [];
        if (category !== 'all') params.push('category=' + category);
        if (keyword) params.push('keyword=' + keyword);
        if (params.length) url += '?' + params.join('&');
        
        products = await apiRequest(url);
        const tbody = document.querySelector('#productTable tbody');
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="empty-message">暂无商品</td></tr>';
            return;
        }
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.unit}</td>
                <td style="color: ${p.stock <= p.warning_stock ? '#e74c3c' : '#333'}; font-weight: ${p.stock <= p.warning_stock ? 'bold' : 'normal'}">${p.stock}</td>
                <td>${p.warning_stock}</td>
                <td>${formatCurrency(p.retail_price)}</td>
                <td>${formatCurrency(p.purchase_price)}</td>
                <td>${p.supplier || '-'}</td>
                <td><button class="btn btn-danger" onclick="deleteProduct(${p.id})">删除</button></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function deleteProduct(id) {
    if (!confirm('确定要删除这个商品吗？')) return;
    try {
        await apiRequest('/products/' + id, 'DELETE');
        showToast('删除成功');
        loadProducts();
    } catch (e) {
        console.error(e);
    }
}

async function loadLowStock() {
    try {
        const lowStockProducts = await apiRequest('/products/low-stock');
        const container = document.getElementById('warningList');
        if (lowStockProducts.length === 0) {
            container.innerHTML = '<div class="empty-message">暂无库存预警商品</div>';
            return;
        }
        container.innerHTML = lowStockProducts.map(p => `
            <div class="warning-item">
                <h4>${p.name}</h4>
                <p>分类: ${p.category} | 单位: ${p.unit}</p>
                <p>零售价: ${formatCurrency(p.retail_price)} | 进货价: ${formatCurrency(p.purchase_price)}</p>
                <p>供应商: ${p.supplier || '-'}</p>
                <div class="stock-info">
                    <span>当前库存: <span class="current-stock">${p.stock}</span></span>
                    <span>预警值: <span class="warning-stock">${p.warning_stock}</span></span>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('statsYear').addEventListener('change', loadMonthlyStats);

async function loadMonthlyStats() {
    try {
        const year = document.getElementById('statsYear').value;
        const stats = await apiRequest('/stats/monthly?year=' + year);
        const tbody = document.querySelector('#statsTable tbody');
        
        if (stats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">暂无统计数据</td></tr>';
            return;
        }
        
        tbody.innerHTML = stats.map(s => `
            <tr>
                <td>${s.month}</td>
                <td>${formatCurrency(s.total_sales)}</td>
                <td>${formatCurrency(s.total_cost)}</td>
                <td style="color: ${s.total_profit >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold">${formatCurrency(s.total_profit)}</td>
                <td>${s.sale_count}</td>
                <td>${s.purchase_count || 0}</td>
            </tr>
        `).join('');
        
        const totalSales = stats.reduce((sum, s) => sum + s.total_sales, 0);
        const totalCost = stats.reduce((sum, s) => sum + s.total_cost, 0);
        const totalProfit = stats.reduce((sum, s) => sum + s.total_profit, 0);
        const totalSaleCount = stats.reduce((sum, s) => sum + s.sale_count, 0);
        const totalPurchaseCount = stats.reduce((sum, s) => sum + (s.purchase_count || 0), 0);
        
        document.getElementById('totalSalesSum').textContent = formatCurrency(totalSales);
        document.getElementById('totalCostSum').textContent = formatCurrency(totalCost);
        document.getElementById('totalProfitSum').textContent = formatCurrency(totalProfit);
        document.getElementById('totalSaleCountSum').textContent = totalSaleCount;
        document.getElementById('totalPurchaseCountSum').textContent = totalPurchaseCount;
    } catch (e) {
        console.error(e);
    }
}

loadDashboard();
