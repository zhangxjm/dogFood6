import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface LiveRoom {
  id: string;
  courseId: number;
  teacherId: number;
  participants: Map<string, { userId: number; name: string; role: string }>;
  isLive: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/live',
})
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, LiveRoom> = new Map();

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.rooms.forEach((room, roomId) => {
      if (room.participants.has(client.id)) {
        room.participants.delete(client.id);
        this.server.to(roomId).emit('participant-left', {
          clientId: client.id,
          participants: Array.from(room.participants.values()),
        });
      }
    });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: number; name: string; role: string; courseId: number; teacherId: number },
  ) {
    const { roomId, userId, name, role, courseId, teacherId } = data;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        courseId,
        teacherId,
        participants: new Map(),
        isLive: false,
      });
    }

    const room = this.rooms.get(roomId);
    room.participants.set(client.id, { userId, name, role });

    client.join(roomId);

    this.server.to(roomId).emit('participant-joined', {
      clientId: client.id,
      user: { userId, name, role },
      participants: Array.from(room.participants.values()),
    });

    return {
      event: 'joined-room',
      data: {
        roomId,
        participants: Array.from(room.participants.values()),
        isLive: room.isLive,
      },
    };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    const room = this.rooms.get(roomId);

    if (room) {
      room.participants.delete(client.id);
      client.leave(roomId);

      this.server.to(roomId).emit('participant-left', {
        clientId: client.id,
        participants: Array.from(room.participants.values()),
      });
    }
  }

  @SubscribeMessage('start-live')
  handleStartLive(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.isLive = true;
      this.server.to(data.roomId).emit('live-started', {
        roomId: data.roomId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('end-live')
  handleEndLive(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.isLive = false;
      this.server.to(data.roomId).emit('live-ended', {
        roomId: data.roomId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('send-message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; message: string; userName: string },
  ) {
    this.server.to(data.roomId).emit('new-message', {
      clientId: client.id,
      userName: data.userName,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('send-offer')
  handleSendOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; targetClientId: string; offer: any },
  ) {
    client.to(data.targetClientId).emit('receive-offer', {
      fromClientId: client.id,
      offer: data.offer,
    });
  }

  @SubscribeMessage('send-answer')
  handleSendAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; targetClientId: string; answer: any },
  ) {
    client.to(data.targetClientId).emit('receive-answer', {
      fromClientId: client.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('send-ice-candidate')
  handleSendIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; targetClientId: string; candidate: any },
  ) {
    client.to(data.targetClientId).emit('receive-ice-candidate', {
      fromClientId: client.id,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('raise-hand')
  handleRaiseHand(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userName: string },
  ) {
    this.server.to(data.roomId).emit('hand-raised', {
      clientId: client.id,
      userName: data.userName,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('screen-share-started')
  handleScreenShareStarted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userName: string },
  ) {
    this.server.to(data.roomId).emit('screen-share-started', {
      clientId: client.id,
      userName: data.userName,
    });
  }

  @SubscribeMessage('screen-share-stopped')
  handleScreenShareStopped(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    this.server.to(data.roomId).emit('screen-share-stopped', {
      clientId: client.id,
    });
  }
}
