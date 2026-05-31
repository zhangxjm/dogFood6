const API_BASE = '/api';

let currentPage = 'dashboard';
let classrooms = [];
let courses = [];
let bookings = [];
let records = [];
let selectedTimeSlot = null;

document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    navigateTo('dashboard');
    setInterval(updateCurrentDate, 60000);
});

function updateCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('zh-CN', options);
}

function navigateTo(page) {
    if (currentPage === page) return;
    
    currentPage = page;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    const titles = {
        dashboard: { title: '数据概览', subtitle: '欢迎使用培训机构教室预约系统' },
        classrooms: { title: '教室管理', subtitle: '管理和配置培训教室场地' },
        booking: { title: '预约使用', subtitle: '预约教室场地进行课程培训' },
        courses: { title: '课程管理', subtitle: '管理培训课程信息' },
        records: { title: '使用记录', subtitle: '查看教室场地使用历史记录' },
        statistics: { title: '统计分析', subtitle: '分析教室使用情况和统计数据' }
    };
    
    document.getElementById('page-title').textContent = titles[page].title;
    document.getElementById('page-subtitle').textContent = titles[page].subtitle;
    
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div style="text-align:center;padding:60px;color:#718096;">
            <div style="font-size:48px;margin-bottom:20px;">⏳</div>
            <p>加载中...</p>
        </div>
    `;
    
    loadPageData(page);
}

async function loadPageData(page) {
    const contentArea = document.getElementById('content-area');
    
    switch(page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'classrooms':
            await loadClassrooms();
            break;
        case 'booking':
            await loadBookingPage();
            break;
        case 'courses':
            await loadCourses();
            break;
        case 'records':
            await loadRecords();
            break;
        case 'statistics':
            await loadStatistics();
            break;
    }
}

async function loadDashboard() {
    try {
        const [classroomsRes, coursesRes, bookingsRes, statsRes] = await Promise.all([
            fetch(`${API_BASE}/classrooms`),
            fetch(`${API_BASE}/courses`),
            fetch(`${API_BASE}/bookings`),
            fetch(`${API_BASE}/statistics`)
        ]);
        
        const [classroomsData, coursesData, bookingsData, statsData] = await Promise.all([
            classroomsRes.json(),
            coursesRes.json(),
            bookingsRes.json(),
            statsRes.json()
        ]);
        
        classrooms = classroomsData.data || [];
        courses = coursesData.data || [];
        bookings = bookingsData.data || [];
        const stats = statsData.data || {};
        
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(b => b.date === today && b.status === 'confirmed');
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">🏢</div>
                    <div class="stat-info">
                        <h3>${classrooms.length}</h3>
                        <p>可用教室</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">📖</div>
                    <div class="stat-info">
                        <h3>${courses.length}</h3>
                        <p>培训课程</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">📅</div>
                    <div class="stat-info">
                        <h3>${todayBookings.length}</h3>
                        <p>今日预约</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">📋</div>
                    <div class="stat-info">
                        <h3>${stats.total_bookings || 0}</h3>
                        <p>总预约次数</p>
                    </div>
                </div>
            </div>
            
            <div class="data-table-container">
                <div class="data-table-header">
                    <h3>📅 今日预约安排</h3>
                </div>
                ${todayBookings.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>时间</th>
                            <th>教室</th>
                            <th>课程</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${todayBookings.sort((a, b) => a.start_time.localeCompare(b.start_time)).map(b => `
                            <tr>
                                <td>${b.start_time} - ${b.end_time}</td>
                                <td>${b.classroom?.name || '-'}</td>
                                <td><span class="course-tag" style="background:${b.course?.color || '#3498db'}">${b.course?.name || '-'}</span></td>
                                <td><span class="status-badge status-${b.status}">${getStatusText(b.status)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>今日暂无预约安排</p>
                </div>
                `}
            </div>
        `;
    } catch (error) {
        console.error('加载数据失败:', error);
        showToast('加载数据失败', 'error');
    }
}

async function loadClassrooms() {
    try {
        const res = await fetch(`${API_BASE}/classrooms`);
        const data = await res.json();
        classrooms = data.data || [];
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="data-table-container">
                <div class="data-table-header">
                    <h3>🏢 教室列表</h3>
                    <div class="table-actions">
                        <button class="btn btn-primary" onclick="showAddClassroomModal()">+ 新增教室</button>
                    </div>
                </div>
                ${classrooms.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>教室名称</th>
                            <th>位置</th>
                            <th>容量</th>
                            <th>设备</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${classrooms.map(c => `
                            <tr>
                                <td><strong>${c.name}</strong></td>
                                <td>${c.location}</td>
                                <td>${c.capacity}人</td>
                                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.equipment}</td>
                                <td><span class="status-badge status-${c.status}">${getStatusText(c.status)}</span></td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn edit" onclick="showEditClassroomModal(${c.id})">编辑</button>
                                        <button class="action-btn delete" onclick="deleteClassroom(${c.id})">删除</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">🏢</div>
                    <p>暂无教室，请添加教室</p>
                </div>
                `}
            </div>
        `;
    } catch (error) {
        console.error('加载教室列表失败:', error);
        showToast('加载教室列表失败', 'error');
    }
}

function showAddClassroomModal() {
    showModal('新增教室', `
        <div class="form-group">
            <label>教室名称 *</label>
            <input type="text" id="classroom-name" placeholder="例如：A101 多媒体教室" required>
        </div>
        <div class="form-group">
            <label>位置 *</label>
            <input type="text" id="classroom-location" placeholder="例如：教学楼A栋1楼" required>
        </div>
        <div class="form-group">
            <label>容量（人）</label>
            <input type="number" id="classroom-capacity" value="30" min="1">
        </div>
        <div class="form-group">
            <label>设备</label>
            <input type="text" id="classroom-equipment" placeholder="例如：投影仪、白板">
        </div>
        <div class="form-group">
            <label>描述</label>
            <textarea id="classroom-description" placeholder="教室描述信息"></textarea>
        </div>
    `, () => {
        const classroom = {
            name: document.getElementById('classroom-name').value,
            location: document.getElementById('classroom-location').value,
            capacity: parseInt(document.getElementById('classroom-capacity').value) || 30,
            equipment: document.getElementById('classroom-equipment').value,
            description: document.getElementById('classroom-description').value
        };
        
        if (!classroom.name || !classroom.location) {
            showToast('请填写必填项', 'warning');
            return false;
        }
        
        createClassroom(classroom);
        return true;
    });
}

function showEditClassroomModal(id) {
    const classroom = classrooms.find(c => c.id === id);
    if (!classroom) return;
    
    showModal('编辑教室', `
        <div class="form-group">
            <label>教室名称 *</label>
            <input type="text" id="classroom-name" value="${classroom.name}" required>
        </div>
        <div class="form-group">
            <label>位置 *</label>
            <input type="text" id="classroom-location" value="${classroom.location}" required>
        </div>
        <div class="form-group">
            <label>容量（人）</label>
            <input type="number" id="classroom-capacity" value="${classroom.capacity}" min="1">
        </div>
        <div class="form-group">
            <label>设备</label>
            <input type="text" id="classroom-equipment" value="${classroom.equipment || ''}">
        </div>
        <div class="form-group">
            <label>描述</label>
            <textarea id="classroom-description">${classroom.description || ''}</textarea>
        </div>
    `, () => {
        const data = {
            name: document.getElementById('classroom-name').value,
            location: document.getElementById('classroom-location').value,
            capacity: parseInt(document.getElementById('classroom-capacity').value) || 30,
            equipment: document.getElementById('classroom-equipment').value,
            description: document.getElementById('classroom-description').value
        };
        
        updateClassroom(id, data);
        return true;
    });
}

async function createClassroom(classroom) {
    try {
        const res = await fetch(`${API_BASE}/classrooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classroom)
        });
        const data = await res.json();
        if (data.code === 201) {
            showToast('创建成功');
            closeModal();
            loadClassrooms();
        } else {
            showToast(data.message || '创建失败', 'error');
        }
    } catch (error) {
        showToast('创建失败', 'error');
    }
}

async function updateClassroom(id, data) {
    try {
        const res = await fetch(`${API_BASE}/classrooms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.code === 200) {
            showToast('更新成功');
            closeModal();
            loadClassrooms();
        } else {
            showToast(result.message || '更新失败', 'error');
        }
    } catch (error) {
        showToast('更新失败', 'error');
    }
}

async function deleteClassroom(id) {
    if (!confirm('确定要删除此教室吗？')) return;
    
    try {
        const res = await fetch(`${API_BASE}/classrooms/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.code === 200) {
            showToast('删除成功');
            loadClassrooms();
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

async function loadCourses() {
    try {
        const res = await fetch(`${API_BASE}/courses`);
        const data = await res.json();
        courses = data.data || [];
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="data-table-container">
                <div class="data-table-header">
                    <h3>📖 课程列表</h3>
                    <div class="table-actions">
                        <button class="btn btn-primary" onclick="showAddCourseModal()">+ 新增课程</button>
                    </div>
                </div>
                ${courses.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>课程名称</th>
                            <th>授课老师</th>
                            <th>课时</th>
                            <th>描述</th>
                            <th>颜色标记</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${courses.map(c => `
                            <tr>
                                <td><span class="course-tag" style="background:${c.color}">${c.name}</span></td>
                                <td>${c.instructor}</td>
                                <td>${c.duration}小时</td>
                                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.description}</td>
                                <td><div style="width:30px;height:30px;background:${c.color};border-radius:6px;"></div></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📖</div>
                    <p>暂无课程，请添加课程</p>
                </div>
                `}
            </div>
        `;
    } catch (error) {
        console.error('加载课程列表失败:', error);
        showToast('加载课程列表失败', 'error');
    }
}

function showAddCourseModal() {
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12', '#1abc9c', '#e91e63', '#00bcd4'];
    
    showModal('新增课程', `
        <div class="form-group">
            <label>课程名称 *</label>
            <input type="text" id="course-name" placeholder="例如：Web前端开发" required>
        </div>
        <div class="form-group">
            <label>授课老师 *</label>
            <input type="text" id="course-instructor" placeholder="例如：张老师" required>
        </div>
        <div class="form-group">
            <label>课时（小时）</label>
            <input type="number" id="course-duration" value="2" min="1">
        </div>
        <div class="form-group">
            <label>描述</label>
            <textarea id="course-description" placeholder="课程描述信息"></textarea>
        </div>
        <div class="form-group">
            <label>颜色标记</label>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
                ${colors.map((color, i) => `
                    <input type="radio" name="course-color" id="color-${i}" value="${color}" ${i === 0 ? 'checked' : ''} style="display:none;">
                    <label for="color-${i}" style="width:30px;height:30px;background:${color};border-radius:6px;cursor:pointer;border:3px solid ${i === 0 ? '#333' : 'transparent'};transition:border 0.3s;" onclick="selectColor(this, '${color}')"></label>
                `).join('')}
            </div>
            <input type="hidden" id="selected-color" value="${colors[0]}">
        </div>
    `, () => {
        const course = {
            name: document.getElementById('course-name').value,
            instructor: document.getElementById('course-instructor').value,
            duration: parseInt(document.getElementById('course-duration').value) || 2,
            description: document.getElementById('course-description').value,
            color: document.getElementById('selected-color').value
        };
        
        if (!course.name || !course.instructor) {
            showToast('请填写必填项', 'warning');
            return false;
        }
        
        createCourse(course);
        return true;
    });
}

function selectColor(element, color) {
    document.querySelectorAll('label[onclick^="selectColor"]').forEach(l => {
        l.style.border = '3px solid transparent';
    });
    element.style.border = '3px solid #333';
    document.getElementById('selected-color').value = color;
}

async function createCourse(course) {
    try {
        const res = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course)
        });
        const data = await res.json();
        if (data.code === 201) {
            showToast('创建成功');
            closeModal();
            loadCourses();
        } else {
            showToast(data.message || '创建失败', 'error');
        }
    } catch (error) {
        showToast('创建失败', 'error');
    }
}

async function loadBookingPage() {
    try {
        const [classroomsRes, coursesRes, bookingsRes] = await Promise.all([
            fetch(`${API_BASE}/classrooms`),
            fetch(`${API_BASE}/courses`),
            fetch(`${API_BASE}/bookings`)
        ]);
        
        const [classroomsData, coursesData, bookingsData] = await Promise.all([
            classroomsRes.json(),
            coursesRes.json(),
            bookingsRes.json()
        ]);
        
        classrooms = classroomsData.data || [];
        courses = coursesData.data || [];
        bookings = bookingsData.data || [];
        
        const today = new Date().toISOString().split('T')[0];
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="data-table-container" style="margin-bottom:20px;">
                <div class="data-table-header">
                    <h3>📅 新增预约</h3>
                </div>
                <div style="padding:20px;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
                        <div class="form-group" style="margin-bottom:0;">
                            <label>选择教室 *</label>
                            <select id="booking-classroom" onchange="loadTimeSlots()">
                                <option value="">请选择教室</option>
                                ${classrooms.map(c => `<option value="${c.id}">${c.name} (${c.location})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label>选择课程 *</label>
                            <select id="booking-course">
                                <option value="">请选择课程</option>
                                ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label>选择日期 *</label>
                            <input type="date" id="booking-date" value="${today}" onchange="loadTimeSlots()">
                        </div>
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:10px;color:#4a5568;font-weight:500;">选择时间段 *</label>
                        <div id="time-slots" class="time-slot-grid" style="margin-bottom:20px;">
                            <div style="grid-column:1/-1;text-align:center;color:#718096;padding:20px;">
                                请先选择教室和日期
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>备注</label>
                        <textarea id="booking-notes" placeholder="预约备注信息"></textarea>
                    </div>
                    <button class="btn btn-primary" onclick="createBooking()" style="margin-top:10px;">📅 提交预约</button>
                </div>
            </div>
            
            <div class="data-table-container">
                <div class="data-table-header">
                    <h3>📋 预约记录</h3>
                    <div class="table-actions">
                        <select id="filter-classroom" onchange="filterBookings()" style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:8px;">
                            <option value="">全部教室</option>
                            ${classrooms.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        <input type="date" id="filter-date" onchange="filterBookings()" style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:8px;">
                    </div>
                </div>
                <div id="bookings-table">
                    ${renderBookingsTable(bookings)}
                </div>
            </div>
        `;
        
        loadTimeSlots();
    } catch (error) {
        console.error('加载预约页面失败:', error);
        showToast('加载数据失败', 'error');
    }
}

async function loadTimeSlots() {
    const classroomId = document.getElementById('booking-classroom').value;
    const date = document.getElementById('booking-date').value;
    
    if (!classroomId || !date) {
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/available-slots?classroom_id=${classroomId}&date=${date}`);
        const data = await res.json();
        
        if (data.code === 200 && data.data) {
            const slotsContainer = document.getElementById('time-slots');
            selectedTimeSlot = null;
            
            slotsContainer.innerHTML = data.data.map(slot => `
                <div class="time-slot ${slot.available ? 'available' : 'booked'}" 
                     onclick="${slot.available ? `selectTimeSlot('${slot.start}', '${slot.end}', this)` : ''}">
                    ${slot.start} - ${slot.end}
                    ${slot.available ? '<br><small>可预约</small>' : '<br><small>已预约</small>'}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('加载时间段失败:', error);
    }
}

function selectTimeSlot(start, end, element) {
    document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    selectedTimeSlot = { start, end };
}

async function createBooking() {
    const classroomId = document.getElementById('booking-classroom').value;
    const courseId = document.getElementById('booking-course').value;
    const date = document.getElementById('booking-date').value;
    const notes = document.getElementById('booking-notes').value;
    
    if (!classroomId) {
        showToast('请选择教室', 'warning');
        return;
    }
    if (!courseId) {
        showToast('请选择课程', 'warning');
        return;
    }
    if (!date) {
        showToast('请选择日期', 'warning');
        return;
    }
    if (!selectedTimeSlot) {
        showToast('请选择时间段', 'warning');
        return;
    }
    
    const booking = {
        classroom_id: parseInt(classroomId),
        course_id: parseInt(courseId),
        date: date,
        start_time: selectedTimeSlot.start,
        end_time: selectedTimeSlot.end,
        notes: notes
    };
    
    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });
        const data = await res.json();
        
        if (data.code === 201) {
            showToast('预约成功');
            loadBookingPage();
        } else {
            showToast(data.message || '预约失败', 'error');
        }
    } catch (error) {
        showToast('预约失败', 'error');
    }
}

function filterBookings() {
    const classroomId = document.getElementById('filter-classroom').value;
    const date = document.getElementById('filter-date').value;
    
    let filtered = [...bookings];
    
    if (classroomId) {
        filtered = filtered.filter(b => b.classroom_id === parseInt(classroomId));
    }
    if (date) {
        filtered = filtered.filter(b => b.date === date);
    }
    
    document.getElementById('bookings-table').innerHTML = renderBookingsTable(filtered);
}

function renderBookingsTable(bookingList) {
    if (bookingList.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>暂无预约记录</p>
            </div>
        `;
    }
    
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>日期</th>
                    <th>时间</th>
                    <th>教室</th>
                    <th>课程</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${bookingList.map(b => `
                    <tr>
                        <td>${b.date}</td>
                        <td>${b.start_time} - ${b.end_time}</td>
                        <td>${b.classroom?.name || '-'}</td>
                        <td><span class="course-tag" style="background:${b.course?.color || '#3498db'}">${b.course?.name || '-'}</span></td>
                        <td><span class="status-badge status-${b.status}">${getStatusText(b.status)}</span></td>
                        <td>
                            <div class="action-buttons">
                                ${b.status === 'confirmed' ? `
                                    <button class="action-btn cancel" onclick="cancelBooking(${b.id})">取消</button>
                                ` : ''}
                                <button class="action-btn delete" onclick="deleteBooking(${b.id})">删除</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function cancelBooking(id) {
    if (!confirm('确定要取消此预约吗？')) return;
    
    try {
        const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
            method: 'PUT'
        });
        const data = await res.json();
        if (data.code === 200) {
            showToast('取消成功');
            loadBookingPage();
        } else {
            showToast(data.message || '取消失败', 'error');
        }
    } catch (error) {
        showToast('取消失败', 'error');
    }
}

async function deleteBooking(id) {
    if (!confirm('确定要删除此预约记录吗？')) return;
    
    try {
        const res = await fetch(`${API_BASE}/bookings/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.code === 200) {
            showToast('删除成功');
            loadBookingPage();
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

async function loadRecords() {
    const startDate = document.getElementById('record-start-date')?.value || getDefaultStartDate();
    const endDate = document.getElementById('record-end-date')?.value || new Date().toISOString().split('T')[0];
    
    try {
        const res = await fetch(`${API_BASE}/records?start_date=${startDate}&end_date=${endDate}`);
        const data = await res.json();
        records = data.data || [];
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="data-table-container">
                <div class="data-table-header">
                    <h3>📋 使用记录</h3>
                    <div class="filter-bar" style="margin:0;">
                        <input type="date" id="record-start-date" value="${startDate}">
                        <span style="align-self:center;">至</span>
                        <input type="date" id="record-end-date" value="${endDate}">
                        <button class="btn btn-secondary" onclick="loadRecords()">查询</button>
                    </div>
                </div>
                ${records.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>时间</th>
                            <th>教室</th>
                            <th>课程</th>
                            <th>时长</th>
                            <th>使用人数</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(r => `
                            <tr>
                                <td>${r.date}</td>
                                <td>${r.start_time} - ${r.end_time}</td>
                                <td>${r.classroom?.name || '-'}</td>
                                <td><span class="course-tag" style="background:${r.course?.color || '#3498db'}">${r.course?.name || '-'}</span></td>
                                <td>${r.duration}小时</td>
                                <td>${r.actual_users}人</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>暂无使用记录</p>
                </div>
                `}
            </div>
        `;
    } catch (error) {
        console.error('加载使用记录失败:', error);
        showToast('加载使用记录失败', 'error');
    }
}

function getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
}

async function loadStatistics() {
    const startDate = getDefaultStartDate();
    const endDate = new Date().toISOString().split('T')[0];
    
    try {
        const res = await fetch(`${API_BASE}/statistics?start_date=${startDate}&end_date=${endDate}`);
        const data = await res.json();
        const stats = data.data || {};
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="stats-grid" style="margin-bottom:20px;">
                <div class="stat-card">
                    <div class="stat-icon blue">📅</div>
                    <div class="stat-info">
                        <h3>${stats.total_bookings || 0}</h3>
                        <p>预约次数</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">📋</div>
                    <div class="stat-info">
                        <h3>${stats.total_records || 0}</h3>
                        <p>使用记录</p>
                    </div>
                </div>
            </div>
            
            <div class="statistics-grid">
                <div class="chart-card">
                    <h3>🏢 教室使用排行</h3>
                    <div class="bar-chart">
                        ${(stats.classroom_stats || []).length > 0 ? 
                            stats.classroom_stats.map((item, index) => `
                                <div class="bar-item">
                                    <span class="bar-label">${item.classroom_name}</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width:${(item.usage_count / Math.max(...stats.classroom_stats.map(s => s.usage_count))) * 100}%;background:hsl(${index * 60}, 70%, 50%);">${item.usage_count}</div>
                                    </div>
                                </div>
                            `).join('') : '<p style="color:#718096;text-align:center;padding:20px;">暂无数据</p>'
                        }
                    </div>
                </div>
                
                <div class="chart-card">
                    <h3>📖 课程使用排行</h3>
                    <div class="bar-chart">
                        ${(stats.course_stats || []).length > 0 ? 
                            stats.course_stats.map((item, index) => `
                                <div class="bar-item">
                                    <span class="bar-label">${item.course_name}</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width:${(item.usage_count / Math.max(...stats.course_stats.map(s => s.usage_count))) * 100}%;background:hsl(${index * 60 + 30}, 70%, 50%);">${item.usage_count}</div>
                                    </div>
                                </div>
                            `).join('') : '<p style="color:#718096;text-align:center;padding:20px;">暂无数据</p>'
                        }
                    </div>
                </div>
            </div>
            
            <div class="data-table-container" style="margin-top:20px;">
                <div class="data-table-header">
                    <h3>📊 每日使用趋势</h3>
                </div>
                ${(stats.daily_stats || []).length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>使用次数</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.daily_stats.map(d => `
                            <tr>
                                <td>${d.date}</td>
                                <td>${d.usage_count}次</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <p>暂无统计数据</p>
                </div>
                `}
            </div>
        `;
    } catch (error) {
        console.error('加载统计数据失败:', error);
        showToast('加载统计数据失败', 'error');
    }
}

function getStatusText(status) {
    const statusMap = {
        'available': '可用',
        'booked': '已占用',
        'confirmed': '已确认',
        'cancelled': '已取消',
        'pending': '待确认'
    };
    return statusMap[status] || status;
}

function showModal(title, content, onConfirm) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal').classList.add('active');
    
    const confirmBtn = document.getElementById('modal-confirm');
    confirmBtn.onclick = function() {
        if (onConfirm && onConfirm() !== false) {
            closeModal();
        }
    };
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = `toast ${type}`;
    }, 3000);
}

function refreshData() {
    loadPageData(currentPage);
    showToast('数据已刷新');
}

let isNavigating = false;
let navDebounceTimer = null;

document.addEventListener('click', function(e) {
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
        e.preventDefault();
        const targetPage = navItem.dataset.page;
        
        if (currentPage === targetPage) return;
        
        if (navDebounceTimer) {
            clearTimeout(navDebounceTimer);
        }
        
        navDebounceTimer = setTimeout(() => {
            if (!isNavigating) {
                isNavigating = true;
                navigateTo(targetPage);
                setTimeout(() => {
                    isNavigating = false;
                }, 500);
            }
        }, 50);
    }
});

document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});
