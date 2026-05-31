const fs = require('fs');
const content = `import { io, Socket } from 'socket.io-client';

class LiveSocketService {
  private socket: Socket | null = null;

  connect(namespace: string = '/live') {
    if (!this.socket) {
      this.socket = io('http://localhost:3001' + namespace, {
        transports: ['websocket', 'polling'],
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinRoom(data: {
    roomId: string;
    userId: number;
    name: string;
    role: string;
    courseId: number;
    teacherId: number;
  }) {
    if (this.socket) {
      this.socket.emit('join-room', data);
    }
  }

  leaveRoom(data: { roomId: string }) {
    if (this.socket) {
      this.socket.emit('leave-room', data);
    }
  }

  startLive(data: { roomId: string }) {
    if (this.socket) {
      this.socket.emit('start-live', data);
    }
  }

  endLive(data: { roomId: string }) {
    if (this.socket) {
      this.socket.emit('end-live', data);
    }
  }

  sendMessage(data: { roomId: string; message: string; userName: string }) {
    if (this.socket) {
      this.socket.emit('send-message', data);
    }
  }

  raiseHand(data: { roomId: string; userName: string }) {
    if (this.socket) {
      this.socket.emit('raise-hand', data);
    }
  }

  sendOffer(data: { roomId: string; targetClientId: string; offer: any }) {
    if (this.socket) {
      this.socket.emit('send-offer', data);
    }
  }

  sendAnswer(data: { roomId: string; targetClientId: string; answer: any }) {
    if (this.socket) {
      this.socket.emit('send-answer', data);
    }
  }

  sendIceCandidate(data: { roomId: string; targetClientId: string; candidate: any }) {
    if (this.socket) {
      this.socket.emit('send-ice-candidate', data);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const liveSocket = new LiveSocketService();
`;
fs.writeFileSync('src/services/socket.ts', content, 'utf8');
console.log('socket.ts 重写完成');
