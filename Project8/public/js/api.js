const API = {
  async request(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    if (options.body && typeof options.body === 'object') {
      finalOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: '网络请求失败' };
    }
  },

  user: {
    login(username, phone) {
      return API.request('/api/user/login', {
        method: 'POST',
        body: { username, phone }
      });
    },
    getInfo(id) {
      return API.request(`/api/user/${id}`);
    },
    list() {
      return API.request('/api/users');
    }
  },

  gears: {
    getList(params = {}) {
      const query = new URLSearchParams(params).toString();
      return API.request(`/api/gears?${query}`);
    },
    getDetail(id) {
      return API.request(`/api/gears/${id}`);
    },
    create(data) {
      return API.request('/api/gears', {
        method: 'POST',
        body: data
      });
    },
    updateStatus(id, status, remark = '') {
      return API.request(`/api/gears/${id}/status`, {
        method: 'PUT',
        body: { status, remark }
      });
    },
    getMyGears(userId, params = {}) {
      const query = new URLSearchParams(params).toString();
      return API.request(`/api/user/${userId}/gears?${query}`);
    }
  },

  messages: {
    getConversations(userId) {
      return API.request(`/api/user/${userId}/conversations`);
    },
    getMessages(userId, otherUserId, gearId) {
      return API.request(`/api/user/${userId}/conversations/${otherUserId}/${gearId}`);
    },
    send(data) {
      return API.request('/api/messages', {
        method: 'POST',
        body: data
      });
    },
    getUnreadCount(userId) {
      return API.request(`/api/user/${userId}/unread`);
    }
  }
};
