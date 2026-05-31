import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/webrtc' })
export class WebrtcGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  private rooms = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    console.log('WebRTC client connected:', client.id);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    const roomId = data.roomId || 'default';
    client.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(client.id);

    const clients = Array.from(this.rooms.get(roomId)).filter(id => id !== client.id);
    client.emit('room_joined', { roomId, clients, peerId: client.id });
    client.broadcast.to(roomId).emit('peer_joined', { peerId: client.id, userId: data.userId });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const roomId = data.roomId;
    client.leave(roomId);

    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(client.id);
      client.broadcast.to(roomId).emit('peer_left', { peerId: client.id });
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetId: string; offer: any },
  ) {
    this.server.to(data.targetId).emit('offer', {
      from: client.id,
      offer: data.offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetId: string; answer: any },
  ) {
    this.server.to(data.targetId).emit('answer', {
      from: client.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('ice_candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetId: string; candidate: any },
  ) {
    this.server.to(data.targetId).emit('ice_candidate', {
      from: client.id,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('toggle_video')
  handleToggleVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; enabled: boolean },
  ) {
    if (data.roomId) {
      client.broadcast.to(data.roomId).emit('peer_video_toggle', {
        peerId: client.id,
        enabled: data.enabled,
      });
    }
  }

  @SubscribeMessage('toggle_audio')
  handleToggleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; enabled: boolean },
  ) {
    if (data.roomId) {
      client.broadcast.to(data.roomId).emit('peer_audio_toggle', {
        peerId: client.id,
        enabled: data.enabled,
      });
    }
  }
}
