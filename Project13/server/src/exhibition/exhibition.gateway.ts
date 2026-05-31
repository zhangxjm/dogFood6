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

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/exhibition' })
export class ExhibitionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private onlineUsers = new Map<string, { socketId: string; userId: string; username: string; position: any; avatar: any }>();

  handleConnection(client: Socket) {
    console.log('Client connected to exhibition:', client.id);
  }

  handleDisconnect(client: Socket) {
    const user = this.onlineUsers.get(client.id);
    if (user) {
      this.server.emit('user_left', { socketId: client.id, userId: user.userId });
      this.onlineUsers.delete(client.id);
      console.log('User disconnected:', user.username);
    }
  }

  @SubscribeMessage('join_exhibition')
  handleJoinExhibition(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { exhibitionId: number; userId: string; username: string; avatar: any },
  ) {
    const user = {
      socketId: client.id,
      userId: data.userId,
      username: data.username,
      position: { x: 0, y: 0, z: 0 },
      avatar: data.avatar || {},
    };
    this.onlineUsers.set(client.id, user);

    const otherUsers = Array.from(this.onlineUsers.values())
      .filter(u => u.socketId !== client.id)
      .map(u => ({ socketId: u.socketId, userId: u.userId, username: u.username, position: u.position, avatar: u.avatar }));

    client.emit('joined_exhibition', { success: true, users: otherUsers });
    client.broadcast.emit('user_joined', { ...user });
  }

  @SubscribeMessage('update_position')
  handleUpdatePosition(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { position: { x: number; y: number; z: number }; rotation: number },
  ) {
    const user = this.onlineUsers.get(client.id);
    if (user) {
      user.position = data.position;
      client.broadcast.emit('user_position_update', {
        socketId: client.id,
        userId: user.userId,
        position: data.position,
        rotation: data.rotation,
      });
    }
  }

  @SubscribeMessage('send_chat')
  handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; targetSocketId?: string },
  ) {
    const user = this.onlineUsers.get(client.id);
    if (user) {
      const chatData = {
        socketId: client.id,
        userId: user.userId,
        username: user.username,
        message: data.message,
        timestamp: new Date().toISOString(),
      };
      if (data.targetSocketId) {
        this.server.to(data.targetSocketId).emit('receive_chat', chatData);
      } else {
        this.server.emit('receive_chat', chatData);
      }
    }
  }

  @SubscribeMessage('enter_booth')
  handleEnterBooth(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boothId: number },
  ) {
    client.join(`booth_${data.boothId}`);
    client.broadcast.to(`booth_${data.boothId}`).emit('user_entered_booth', {
      socketId: client.id,
      boothId: data.boothId,
    });
  }

  @SubscribeMessage('leave_booth')
  handleLeaveBooth(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boothId: number },
  ) {
    client.leave(`booth_${data.boothId}`);
    client.broadcast.to(`booth_${data.boothId}`).emit('user_left_booth', {
      socketId: client.id,
      boothId: data.boothId,
    });
  }
}
