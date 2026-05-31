let currentAppliance = null;

function showSection(sectionId, event) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        document.querySelector(`.nav-btn[onclick*="${sectionId}"]`).classList.add('active');
    }

    if (sectionId === 'appliances') {
        loadAppliances();
        loadCategories();
    } else if (sectionId === 'rentals') {
        loadRentals();
    } else if (sectionId === 'reminders') {
        loadReminders();
    }
}

async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const result = await response.json();
        if (result.success) {
            const select = document.getElementById('categoryFilter');
            const currentValue = select.value;
            select.innerHTML = '<option value="">全部分类</option>';
            result.data.forEach(cat => {
                select.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
            select.value = currentValue;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadAppliances() {
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let url = '/api/appliances';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (params.toString()) url += '?' + params.toString();

    try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
            renderAppliances(result.data);
        }
    } catch (error) {
        console.error('Error loading appliances:', error);
    }
}

function renderAppliances(appliances) {
    const container = document.getElementById('applianceList');
    
    if (appliances.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <svg viewBox="0 0 24 24"><path d="M21 6h-2V4c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2H3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12H9v-2h4v2zm0-3H9v-2h4v2zm0-3H9V8h4v4zm5 6h-4v-2h4v2zm0-3h-4v-2h4v2zm0-3h-4V8h4v4zM7 4h10v2H7V4z"/></svg>
                <p>暂无家电信息</p>
            </div>
        `;
        return;
    }

    container.innerHTML = appliances.map(a => `
        <div class="card">
            <div class="card-header">
                <h3>${a.name}</h3>
                <span class="status-badge ${a.status === 'available' ? 'status-available' : 'status-rented'}">
                    ${a.status === 'available' ? '可租' : '已租'}
                </span>
            </div>
            <span class="card-category">${a.category}</span>
            <p class="card-description">${a.description || '暂无描述'}</p>
            <div class="card-details">
                ${a.brand ? `<div>品牌：${a.brand}${a.model ? ' / ' + a.model : ''}</div>` : ''}
                ${a.location ? `<div>位置：${a.location}</div>` : ''}
            </div>
            <div class="card-price">¥${a.daily_price} <span style="font-size: 14px; color: #999;">/天</span></div>
            <div class="card-contact">
                <div>联系人：${a.contact_name}</div>
                <div>电话：${a.contact_phone}</div>
            </div>
            ${a.status === 'available' ? 
                `<button class="btn-primary" onclick="openRentalModal(${a.id})">立即租赁</button>` :
                `<button class="btn-primary" disabled>已出租</button>`
            }
        </div>
    `).join('');
}

async function openRentalModal(applianceId) {
    try {
        const response = await fetch(`/api/appliances/${applianceId}`);
        const result = await response.json();
        if (result.success) {
            currentAppliance = result.data;
            document.getElementById('rentalApplianceId').value = applianceId;
            document.getElementById('rentalApplianceInfo').innerHTML = `
                <p><strong>${currentAppliance.name}</strong></p>
                <p>日租金：¥${currentAppliance.daily_price} /天</p>
            `;
            
            const today = new Date().toISOString().split('T')[0];
            document.querySelector('input[name="start_date"]').value = today;
            document.querySelector('input[name="start_date"]').min = today;
            document.querySelector('input[name="end_date"]').min = today;
            
            document.getElementById('rentalModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading appliance:', error);
    }
}

function closeModal() {
    document.getElementById('rentalModal').classList.remove('active');
    document.getElementById('rentalForm').reset();
    document.getElementById('rentalPricePreview').innerHTML = '';
    currentAppliance = null;
}

function calculateRentalPrice() {
    const startDate = document.querySelector('input[name="start_date"]').value;
    const endDate = document.querySelector('input[name="end_date"]').value;
    
    if (startDate && endDate && currentAppliance) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        if (days > 0) {
            const total = days * currentAppliance.daily_price;
            document.getElementById('rentalPricePreview').innerHTML = `
                <p>租赁天数：<strong>${days}</strong> 天</p>
                <p style="font-size: 24px; color: #e53935; margin-top: 10px;">
                    总计：¥${total.toFixed(2)}
                </p>
            `;
        } else {
            document.getElementById('rentalPricePreview').innerHTML = `
                <p style="color: #e53935;">结束日期必须晚于开始日期</p>
            `;
        }
    }
}

async function loadRentals() {
    try {
        const response = await fetch('/api/rentals');
        const result = await response.json();
        if (result.success) {
            renderRentals(result.data);
        }
    } catch (error) {
        console.error('Error loading rentals:', error);
    }
}

function renderRentals(rentals) {
    const container = document.getElementById('rentalList');
    
    if (rentals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
                <p>暂无租赁记录</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>家电名称</th>
                    <th>租客</th>
                    <th>联系电话</th>
                    <th>开始日期</th>
                    <th>结束日期</th>
                    <th>总租金</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${rentals.map(r => `
                    <tr>
                        <td>${r.appliance_name}</td>
                        <td>${r.renter_name}</td>
                        <td>${r.renter_phone}</td>
                        <td>${r.start_date}</td>
                        <td>${r.end_date}</td>
                        <td>¥${r.total_price}</td>
                        <td>
                            <span class="status-badge ${r.status === 'active' ? 'status-rented' : 'status-available'}">
                                ${r.status === 'active' ? '租赁中' : '已完成'}
                            </span>
                        </td>
                        <td>
                            ${r.status === 'active' ? 
                                `<button class="btn-success" onclick="completeRental(${r.id})">完成租赁</button>` :
                                '-'
                            }
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function completeRental(rentalId) {
    if (!confirm('确认完成该租赁？')) return;
    
    try {
        const response = await fetch(`/api/rentals/${rentalId}/complete`, {
            method: 'PUT'
        });
        const result = await response.json();
        if (result.success) {
            alert('租赁已完成！');
            loadRentals();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error completing rental:', error);
        alert('操作失败');
    }
}

async function loadReminders() {
    try {
        const response = await fetch('/api/reminders');
        const result = await response.json();
        if (result.success) {
            renderReminders(result.data);
        }
    } catch (error) {
        console.error('Error loading reminders:', error);
    }
}

function renderReminders(reminders) {
    const container = document.getElementById('reminderList');
    
    if (reminders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                <p>暂无到期提醒</p>
            </div>
        `;
        return;
    }

    container.innerHTML = reminders.map(r => {
        const today = new Date();
        const endDate = new Date(r.end_date);
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        const isUrgent = daysLeft <= 1;
        
        return `
            <div class="reminder-card ${isUrgent ? 'urgent' : ''}">
                <h4>
                    ${isUrgent ? '⚠️ 紧急提醒：' : '⏰ 即将到期：'}
                    ${r.appliance_name}
                </h4>
                <div class="reminder-details">
                    <p>租客：${r.renter_name}（${r.renter_phone}）</p>
                    <p>到期日期：${r.end_date}</p>
                    <p>剩余天数：<strong>${daysLeft > 0 ? daysLeft + ' 天' : '今天到期'}</strong></p>
                </div>
            </div>
        `;
    }).join('');
}

document.getElementById('publishForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/appliances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('家电发布成功！');
            this.reset();
            showSection('appliances');
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error publishing appliance:', error);
        alert('发布失败');
    }
});

document.getElementById('rentalForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/rentals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('租赁登记成功！');
            closeModal();
            loadAppliances();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error creating rental:', error);
        alert('租赁登记失败');
    }
});

document.querySelector('input[name="start_date"]').addEventListener('change', calculateRentalPrice);
document.querySelector('input[name="end_date"]').addEventListener('change', calculateRentalPrice);

document.getElementById('rentalModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    loadAppliances();
    loadCategories();
});
