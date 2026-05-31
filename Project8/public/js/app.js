const App = {
  currentUser: null,
  currentPage: 'home',
  currentGearList: [],
  conversations: [],
  currentConversation: null,
  messages: [],

  init() {
    this.loadUser();
    this.bindEvents();
    this.navigateTo('home');
    this.refreshUnreadCount();
  },

  loadUser() {
    const saved = localStorage.getItem('fishing_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      this.updateUserArea();
    }
  },

  saveUser(user) {
    this.currentUser = user;
    localStorage.setItem('fishing_user', JSON.stringify(user));
    this.updateUserArea();
    this.refreshUnreadCount();
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('fishing_user');
    this.updateUserArea();
    this.refreshUnreadCount();
    this.navigateTo('home');
  },

  updateUserArea() {
    const area = document.getElementById('userArea');
    if (this.currentUser) {
      area.innerHTML = `
        <div class="user-info">
          <div class="user-avatar">👤</div>
          <span>${this.currentUser.username}</span>
          <button class="btn btn-sm btn-outline" id="logoutBtn">退出</button>
        </div>
      `;
      document.getElementById('logoutBtn').onclick = () => this.logout();
    } else {
      area.innerHTML = `<button class="btn btn-primary" id="loginBtn">登录</button>`;
      document.getElementById('loginBtn').onclick = () => this.showLoginModal();
    }
  },

  refreshUnreadCount() {
    const badge = document.getElementById('unreadBadge');
    if (!this.currentUser) {
      badge.style.display = 'none';
      return;
    }

    API.messages.getUnreadCount(this.currentUser.id).then(res => {
      if (res.success && res.data.count > 0) {
        badge.textContent = res.data.count;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    });
  },

  bindEvents() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page === 'publish' || page === 'my' || page === 'messages') {
          if (!this.currentUser) {
            this.showLoginModal();
            return;
          }
        }
        this.navigateTo(page);
      };
    });

    document.getElementById('closeLogin').onclick = () => {
      document.getElementById('loginModal').classList.remove('show');
    };

    document.getElementById('loginForm').onsubmit = (e) => {
      e.preventDefault();
      this.handleLogin();
    };
  },

  showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
  },

  async handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const phone = document.getElementById('loginPhone').value;

    const res = await API.user.login(username, phone);
    if (res.success) {
      this.saveUser(res.data);
      document.getElementById('loginModal').classList.remove('show');
      document.getElementById('loginForm').reset();
      if (this.currentPage === 'home') {
        this.loadHomePage();
      } else {
        this.navigateTo(this.currentPage);
      }
    } else {
      alert(res.message);
    }
  },

  navigateTo(page, params = {}) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    this.currentPage = page;
    const content = document.getElementById('pageContent');

    switch (page) {
      case 'home':
        this.loadHomePage();
        break;
      case 'publish':
        this.loadPublishPage();
        break;
      case 'my':
        this.loadMyPage();
        break;
      case 'messages':
        this.loadMessagesPage();
        break;
      case 'detail':
        this.loadDetailPage(params.id);
        break;
    }
  },

  async loadHomePage() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
      <div class="filter-bar">
        <div class="search-box">
          <input type="text" id="searchInput" placeholder="搜索渔具名称或描述...">
        </div>
        <select class="filter-select" id="categoryFilter">
          <option value="">全部分类</option>
          <option value="鱼竿">鱼竿</option>
          <option value="鱼线轮">鱼线轮</option>
          <option value="鱼饵">鱼饵</option>
          <option value="配件">配件</option>
          <option value="其他">其他</option>
        </select>
        <select class="filter-select" id="statusFilter">
          <option value="">全部状态</option>
          <option value="consigning">寄售中</option>
          <option value="sold">已售出</option>
        </select>
      </div>
      <div id="gearList" class="gear-grid"></div>
      <div id="pagination" class="pagination"></div>
    `;

    document.getElementById('searchInput').oninput = () => this.loadGearList();
    document.getElementById('categoryFilter').onchange = () => this.loadGearList();
    document.getElementById('statusFilter').onchange = () => this.loadGearList();

    this.loadGearList();
  },

  async loadGearList(page = 1) {
    const keyword = document.getElementById('searchInput')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';

    const res = await API.gears.getList({ page, pageSize: 9, keyword, category, status });
    
    if (res.success) {
      this.currentGearList = res.data.list;
      this.renderGearList(res.data);
      this.renderPagination(res.data);
    }
  },

  renderGearList(data) {
    const listEl = document.getElementById('gearList');
    
    if (data.list.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">🎣</div>
          <p>暂无寄售渔具</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = data.list.map(gear => `
      <div class="gear-card" onclick="App.navigateTo('detail', {id: ${gear.id}})">
        <img src="${gear.images || 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400'}" class="gear-card-img" alt="${gear.title}">
        <div class="gear-card-body">
          <h3 class="gear-card-title">${gear.title}</h3>
          <div class="gear-card-meta">
            <span class="gear-card-category">${gear.category}</span>
            <span class="gear-card-condition">${gear.condition}</span>
          </div>
          <div class="gear-card-price">
            <span class="price-current">¥${gear.price}</span>
            ${gear.originalPrice ? `<span class="price-original">¥${gear.originalPrice}</span>` : ''}
          </div>
          <div class="gear-card-footer">
            <span>👁️ ${gear.viewCount}</span>
            <span class="status-badge status-${gear.status}">${gear.statusText}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderPagination(data) {
    const totalPages = Math.ceil(data.total / data.pageSize);
    const paginationEl = document.getElementById('pagination');
    
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    let html = `<button onclick="App.loadGearList(${data.page - 1})" ${data.page === 1 ? 'disabled' : ''}>上一页</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="${i === data.page ? 'active' : ''}" onclick="App.loadGearList(${i})">${i}</button>`;
    }
    
    html += `<button onclick="App.loadGearList(${data.page + 1})" ${data.page === totalPages ? 'disabled' : ''}>下一页</button>`;
    
    paginationEl.innerHTML = html;
  },

  loadPublishPage() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 700px; margin: 0 auto;">
        <h2 style="margin-bottom: 25px; font-size: 22px;">发布寄售信息</h2>
        <form id="publishForm">
          <div class="form-group">
            <label>标题 *</label>
            <input type="text" name="title" placeholder="请输入渔具标题，突出卖点" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类 *</label>
              <select name="category" required>
                <option value="">请选择分类</option>
                <option value="鱼竿">鱼竿</option>
                <option value="鱼线轮">鱼线轮</option>
                <option value="鱼饵">鱼饵</option>
                <option value="配件">配件</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>品牌</label>
              <input type="text" name="brand" placeholder="请输入品牌">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>成色 *</label>
              <select name="condition" required>
                <option value="">请选择成色</option>
                <option value="全新">全新</option>
                <option value="九成新">九成新</option>
                <option value="八成新">八成新</option>
                <option value="七成新">七成新</option>
                <option value="六成新及以下">六成新及以下</option>
              </select>
            </div>
            <div class="form-group">
              <label>所在地区</label>
              <input type="text" name="location" placeholder="如：北京市朝阳区">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>寄售价格(元) *</label>
              <input type="number" name="price" step="0.01" min="0" placeholder="请输入寄售价格" required>
            </div>
            <div class="form-group">
              <label>原价(元)</label>
              <input type="number" name="originalPrice" step="0.01" min="0" placeholder="请输入购买时的价格">
            </div>
          </div>
          <div class="form-group">
            <label>图片链接</label>
            <input type="text" name="images" placeholder="请输入图片URL，多张用逗号分隔">
          </div>
          <div class="form-group">
            <label>详细描述 *</label>
            <textarea name="description" placeholder="请详细描述渔具的情况，包括使用时间、保养情况、有无瑕疵等" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-block" style="padding: 12px; font-size: 16px;">立即发布</button>
        </form>
      </div>
    `;

    document.getElementById('publishForm').onsubmit = (e) => {
      e.preventDefault();
      this.handlePublish();
    };
  },

  async handlePublish() {
    const form = document.getElementById('publishForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.ownerId = this.currentUser.id;

    const res = await API.gears.create(data);
    if (res.success) {
      alert('发布成功！');
      this.navigateTo('my');
    } else {
      alert(res.message);
    }
  },

  async loadMyPage() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
      <h2 style="margin-bottom: 25px; font-size: 22px;">我的寄售</h2>
      <div id="myGearList" class="gear-grid"></div>
    `;

    const res = await API.gears.getMyGears(this.currentUser.id);
    const listEl = document.getElementById('myGearList');

    if (!res.success || res.data.list.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">📦</div>
          <p>您还没有发布任何寄售信息</p>
          <button class="btn btn-primary" style="margin-top: 20px;" onclick="App.navigateTo('publish')">去发布</button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = res.data.list.map(gear => `
      <div class="gear-card" onclick="App.navigateTo('detail', {id: ${gear.id}})">
        <img src="${gear.images || 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400'}" class="gear-card-img" alt="${gear.title}">
        <div class="gear-card-body">
          <h3 class="gear-card-title">${gear.title}</h3>
          <div class="gear-card-price">
            <span class="price-current">¥${gear.price}</span>
          </div>
          <div class="gear-card-footer">
            <span>👁️ ${gear.viewCount}</span>
            <span class="status-badge status-${gear.status}">${gear.statusText}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  async loadDetailPage(id) {
    const content = document.getElementById('pageContent');
    content.innerHTML = '<div style="text-align: center; padding: 50px;">加载中...</div>';

    const res = await API.gears.getDetail(id);
    if (!res.success) {
      content.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
      return;
    }

    const gear = res.data;
    const isOwner = this.currentUser && this.currentUser.id === gear.ownerId;

    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <button class="btn btn-outline" onclick="App.navigateTo('home')">← 返回列表</button>
      </div>
      <div class="detail-container">
        <div class="detail-images">
          <img src="${gear.images || 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800'}" class="main-image" alt="${gear.title}">
        </div>
        <div class="detail-info">
          <h1 class="detail-title">${gear.title}</h1>
          <div class="detail-price">
            <span style="font-size: 32px; font-weight: bold; color: #e53935;">¥${gear.price}</span>
            ${gear.originalPrice ? `<span style="font-size: 18px; color: #999; text-decoration: line-through;">¥${gear.originalPrice}</span>` : ''}
          </div>
          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">分类</span>
              <span class="meta-value">${gear.category}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">成色</span>
              <span class="meta-value">${gear.condition}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">品牌</span>
              <span class="meta-value">${gear.brand || '-'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">所在地区</span>
              <span class="meta-value">${gear.location || '-'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">浏览次数</span>
              <span class="meta-value">${gear.viewCount}次</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">当前状态</span>
              <span class="meta-value"><span class="status-badge status-${gear.status}">${gear.statusText}</span></span>
            </div>
          </div>
          <div class="detail-description">
            <h4>商品描述</h4>
            <p>${gear.description}</p>
          </div>
          <div class="detail-actions">
            ${isOwner ? `
              <select class="filter-select" id="statusSelect" style="flex: 1;">
                <option value="consigning" ${gear.status === 'consigning' ? 'selected' : ''}>寄售中</option>
                <option value="sold" ${gear.status === 'sold' ? 'selected' : ''}>已售出</option>
                <option value="cancelled" ${gear.status === 'cancelled' ? 'selected' : ''}>已取消</option>
              </select>
              <button class="btn btn-primary" onclick="App.updateStatus(${gear.id})">更新状态</button>
            ` : `
              ${this.currentUser ? `
                <button class="btn btn-primary" onclick="App.startChat(${gear.id}, ${gear.ownerId}, '${gear.title.replace(/'/g, "\\'")}')" style="flex: 1;">💬 意向沟通</button>
              ` : `
                <button class="btn btn-primary" onclick="App.showLoginModal()" style="flex: 1;">登录后沟通</button>
              `}
            `}
          </div>
          ${gear.owner ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="user-avatar" style="width: 40px; height: 40px; background: #1e88e5; color: white;">👤</div>
                <div>
                  <div style="font-weight: 600;">${gear.owner.username}</div>
                  <div style="font-size: 13px; color: #888;">${gear.owner.phone}</div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="status-timeline">
        <h3>📋 状态跟进记录</h3>
        <div class="timeline-list">
          ${gear.statusLogs.map(log => `
            <div class="timeline-item">
              <div class="timeline-time">${new Date(log.created_at).toLocaleString('zh-CN')}</div>
              <div class="timeline-content">
                ${log.fromStatusText ? `<strong>${log.fromStatusText}</strong> → ` : ''}
                <strong>${log.toStatusText}</strong>
                ${log.remark ? `<br><span style="color: #666;">${log.remark}</span>` : ''}
                <br><span style="color: #888; font-size: 12px;">操作人：${log.operator}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async updateStatus(id) {
    const status = document.getElementById('statusSelect').value;
    const res = await API.gears.updateStatus(id, status);
    if (res.success) {
      alert('状态更新成功！');
      this.loadDetailPage(id);
    } else {
      alert(res.message);
    }
  },

  startChat(gearId, ownerId, gearTitle) {
    this.navigateTo('messages');
    setTimeout(() => {
      this.openConversation(gearId, ownerId, gearTitle);
    }, 500);
  },

  async loadMessagesPage() {
    const content = document.getElementById('pageContent');
    content.innerHTML = `
      <h2 style="margin-bottom: 25px; font-size: 22px;">消息中心</h2>
      <div class="messages-container">
        <div class="conversations-list" id="conversationsList"></div>
        <div class="chat-area" id="chatArea">
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #888;">
            选择一个会话开始聊天
          </div>
        </div>
      </div>
    `;

    const res = await API.messages.getConversations(this.currentUser.id);
    this.conversations = res.success ? res.data : [];
    
    const listEl = document.getElementById('conversationsList');
    
    if (this.conversations.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>暂无消息</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.conversations.map((conv, index) => `
      <div class="conversation-item ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="conversation-header">
          <span class="conversation-user">${conv.otherUserName}</span>
          ${conv.unreadCount > 0 ? `<span class="conversation-unread">${conv.unreadCount}</span>` : ''}
        </div>
        <div class="conversation-gear">📦 ${conv.gearTitle}</div>
        <div class="conversation-preview">${conv.lastMessage}</div>
        <div class="conversation-time">${new Date(conv.lastMessageTime).toLocaleString('zh-CN')}</div>
      </div>
    `).join('');

    listEl.querySelectorAll('.conversation-item').forEach(item => {
      item.onclick = () => {
        const index = parseInt(item.dataset.index);
        this.currentConversation = this.conversations[index];
        this.renderConversation();
        
        listEl.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      };
    });

    if (this.conversations.length > 0) {
      this.currentConversation = this.conversations[0];
      this.renderConversation();
    }

    this.refreshUnreadCount();
  },

  async openConversation(gearId, otherUserId, gearTitle) {
    this.currentConversation = {
      gearId,
      otherUserId,
      otherUserName: '卖家',
      gearTitle
    };
    this.renderConversation();
  },

  async renderConversation() {
    const chatArea = document.getElementById('chatArea');
    if (!this.currentConversation) return;

    const res = await API.messages.getMessages(
      this.currentUser.id,
      this.currentConversation.otherUserId,
      this.currentConversation.gearId
    );
    this.messages = res.success ? res.data.list : [];

    chatArea.innerHTML = `
      <div class="chat-header">
        <div>
          <div class="chat-title">${this.currentConversation.otherUserName}</div>
          <div class="chat-subtitle">关于：${this.currentConversation.gearTitle}</div>
        </div>
      </div>
      <div class="chat-messages" id="chatMessages">
        ${this.messages.map(msg => `
          <div class="message-item ${msg.senderId === this.currentUser.id ? 'sent' : 'received'}">
            <div>
              <div class="message-content">${msg.content}</div>
              <div class="message-time">${new Date(msg.created_at).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="chat-input-area">
        <input type="text" id="messageInput" placeholder="输入消息...">
        <button class="send-btn" onclick="App.sendMessage()">➤</button>
      </div>
    `;

    document.getElementById('messageInput').onkeypress = (e) => {
      if (e.key === 'Enter') this.sendMessage();
    };

    const messagesEl = document.getElementById('chatMessages');
    messagesEl.scrollTop = messagesEl.scrollHeight;

    this.refreshUnreadCount();
  },

  async sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content || !this.currentConversation) return;

    const res = await API.messages.send({
      gearId: this.currentConversation.gearId,
      senderId: this.currentUser.id,
      receiverId: this.currentConversation.otherUserId,
      content
    });

    if (res.success) {
      input.value = '';
      this.renderConversation();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
