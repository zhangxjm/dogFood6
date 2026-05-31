const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.currentRoom = null;
    this.currentUser = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(user) {
    return new Promise((resolve, reject) => {
      try {
        this.currentUser = user;
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log('[WS] Connected to server');
          this.reconnectAttempts = 0;
          resolve(this.ws);
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        };

        this.ws.onerror = (error) => {
          console.error('[WS] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WS] Disconnected');
          this.emit('disconnected', {});
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    setTimeout(() => {
      console.log(`[WS] Reconnecting... Attempt ${this.reconnectAttempts}`);
      if (this.currentUser) {
        this.connect(this.currentUser);
      }
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.currentRoom = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WS] Error in listener for ${event}:`, error);
        }
      });
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WS] Cannot send message, not connected');
    }
  }

  joinRoom(roomCode) {
    if (!this.currentUser) {
      console.error('[WS] No user logged in');
      return;
    }
    this.currentRoom = roomCode;
    this.send('join_room', { roomCode, user: this.currentUser });
  }

  leaveRoom(roomCode) {
    if (!this.currentUser) return;
    this.send('leave_room', { roomCode, user: this.currentUser });
    this.currentRoom = null;
  }

  syncState(state) {
    if (!this.currentRoom || !this.currentUser) return;
    this.send('sync_state', {
      roomCode: this.currentRoom,
      state,
      userId: this.currentUser.id
    });
  }

  sendOperation(operation) {
    if (!this.currentRoom || !this.currentUser) return;
    this.send('operation', {
      roomCode: this.currentRoom,
      operation,
      user: this.currentUser
    });
  }

  sendChat(message) {
    if (!this.currentRoom || !this.currentUser) return;
    this.send('chat', {
      roomCode: this.currentRoom,
      message,
      user: this.currentUser
    });
  }

  sendCursor(position) {
    if (!this.currentRoom || !this.currentUser) return;
    this.send('cursor', {
      roomCode: this.currentRoom,
      position,
      userId: this.currentUser.id
    });
  }

  requestState() {
    if (!this.currentRoom) return;
    this.send('request_state', { roomCode: this.currentRoom });
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

const wsService = new WebSocketService();
export default wsService;
