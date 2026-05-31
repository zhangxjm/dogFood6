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
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { MeetingRoomService } from '../modules/meeting-room/meeting-room.service';
import { DocumentService } from '../modules/document/document.service';
import { UserService } from '../modules/user/user.service';
import { DesktopShareService } from '../modules/desktop-share/desktop-share.service';

interface UserSocketData {
  userId: string;
  username: string;
  nickname: string;
  avatar: string;
  roomId?: string;
  documentId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, UserSocketData>();

  constructor(
    private roomService: MeetingRoomService,
    private documentService: DocumentService,
    private userService: UserService,
    private shareService: DesktopShareService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.cookie?.split('token=')?.[1]?.split(';')?.[0];

      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = jwt.verify(token, jwtConfig.secret) as any;
      const userData: UserSocketData = {
        userId: decoded.id,
        username: decoded.username,
        nickname: decoded.nickname,
        avatar: decoded.avatar,
      };

      this.connectedUsers.set(client.id, userData);
      await this.userService.updateStatus(decoded.id, 'online');

      this.server.emit('user:online', {
        userId: decoded.id,
        user: userData,
      });

      this.server.emit('users:list', await this.getOnlineUsersList());
    } catch (e) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userData = this.connectedUsers.get(client.id);
    if (userData) {
      if (userData.roomId) {
        await this.leaveRoom(client, { roomId: userData.roomId });
      }
      if (userData.documentId) {
        await this.leaveDocument(client, { documentId: userData.documentId });
      }

      await this.userService.updateStatus(userData.userId, 'offline');
      this.connectedUsers.delete(client.id);

      this.server.emit('user:offline', {
        userId: userData.userId,
      });

      this.server.emit('users:list', await this.getOnlineUsersList());
    }
  }

  private async getOnlineUsersList() {
    const users = await this.userService.getOnlineUsers();
    return users;
  }

  @SubscribeMessage('room:join')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || !data.roomId) return;

    if (userData.roomId && userData.roomId !== data.roomId) {
      await this.leaveRoom(client, { roomId: userData.roomId });
    }

    try {
      await this.roomService.joinRoom(data.roomId, userData.userId);
      client.join(`room:${data.roomId}`);
      userData.roomId = data.roomId;

      const members = await this.roomService.getRoomMembers(data.roomId);
      const messages = await this.roomService.getRoomMessages(data.roomId, 50);
      const activeShare = await this.shareService.findActive(data.roomId);

      this.server.to(`room:${data.roomId}`).emit('room:member-joined', {
        userId: userData.userId,
        user: userData,
        members,
      });

      client.emit('room:joined', {
        roomId: data.roomId,
        members,
        messages,
        activeShare,
      });
    } catch (e) {
      client.emit('error', { message: e.message });
    }
  }

  @SubscribeMessage('room:leave')
  async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || !data.roomId) return;

    await this.roomService.leaveRoom(data.roomId, userData.userId);
    await this.shareService.stopShareByRoom(data.roomId, userData.userId);
    client.leave(`room:${data.roomId}`);

    const members = await this.roomService.getRoomMembers(data.roomId);

    this.server.to(`room:${data.roomId}`).emit('room:member-left', {
      userId: userData.userId,
      members,
    });

    userData.roomId = undefined;
    client.emit('room:left', { roomId: data.roomId });
  }

  @SubscribeMessage('room:move')
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; position: any; rotation: any },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.roomId !== data.roomId) return;

    await this.roomService.updateMemberPosition(
      data.roomId,
      userData.userId,
      data.position,
      data.rotation,
    );

    client.to(`room:${data.roomId}`).emit('room:user-moved', {
      userId: userData.userId,
      position: data.position,
      rotation: data.rotation,
      user: userData,
    });
  }

  @SubscribeMessage('room:chat')
  async handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; type?: string },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.roomId !== data.roomId) return;

    const message = await this.roomService.sendMessage(
      data.roomId,
      userData.userId,
      data.content,
      (data.type as any) || 'text',
    );

    this.server.to(`room:${data.roomId}`).emit('room:message', {
      message,
      user: userData,
    });
  }

  @SubscribeMessage('room:audio-state')
  handleAudioState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; muted: boolean },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.roomId !== data.roomId) return;

    client.to(`room:${data.roomId}`).emit('room:audio-state', {
      userId: userData.userId,
      muted: data.muted,
    });
  }

  @SubscribeMessage('document:join')
  async joinDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || !data.documentId) return;

    try {
      await this.documentService.setActive(data.documentId, userData.userId, true);
      client.join(`doc:${data.documentId}`);
      userData.documentId = data.documentId;

      const collaborators = await this.documentService.getActiveCollaborators(data.documentId);
      const doc = await this.documentService.findOne(data.documentId, userData.userId);

      this.server.to(`doc:${data.documentId}`).emit('document:user-joined', {
        userId: userData.userId,
        user: userData,
        collaborators,
      });

      client.emit('document:joined', {
        documentId: data.documentId,
        document: doc,
        collaborators,
      });
    } catch (e) {
      client.emit('error', { message: e.message });
    }
  }

  @SubscribeMessage('document:leave')
  async leaveDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || !data.documentId) return;

    await this.documentService.setActive(data.documentId, userData.userId, false);
    client.leave(`doc:${data.documentId}`);

    const collaborators = await this.documentService.getActiveCollaborators(data.documentId);

    this.server.to(`doc:${data.documentId}`).emit('document:user-left', {
      userId: userData.userId,
      collaborators,
    });

    userData.documentId = undefined;
    client.emit('document:left', { documentId: data.documentId });
  }

  @SubscribeMessage('document:change')
  async handleDocumentChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; delta: any; content: string },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.documentId !== data.documentId) return;

    try {
      await this.documentService.update(data.documentId, userData.userId, {
        content: data.content,
        delta: JSON.stringify(data.delta),
      });

      client.to(`doc:${data.documentId}`).emit('document:changed', {
        userId: userData.userId,
        delta: data.delta,
        content: data.content,
        user: userData,
      });
    } catch (e) {
      client.emit('error', { message: e.message });
    }
  }

  @SubscribeMessage('document:cursor')
  async handleCursor(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; position: any; selection?: any },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.documentId !== data.documentId) return;

    await this.documentService.updateCursor(
      data.documentId,
      userData.userId,
      data.position,
      data.selection,
    );

    client.to(`doc:${data.documentId}`).emit('document:cursor-moved', {
      userId: userData.userId,
      position: data.position,
      selection: data.selection,
      user: userData,
    });
  }

  @SubscribeMessage('share:start')
  async handleShareStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; streamId: string; sourceType: string; width: number; height: number },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.roomId !== data.roomId) return;

    try {
      const share = await this.shareService.startShare(
        userData.userId,
        data.roomId,
        {
          streamId: data.streamId,
          sourceType: data.sourceType as any,
          width: data.width,
          height: data.height,
        },
      );

      this.server.to(`room:${data.roomId}`).emit('share:started', {
        share,
        user: userData,
      });
    } catch (e) {
      client.emit('error', { message: e.message });
    }
  }

  @SubscribeMessage('share:stop')
  async handleShareStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.roomId !== data.roomId) return;

    await this.shareService.stopShareByRoom(data.roomId, userData.userId);

    this.server.to(`room:${data.roomId}`).emit('share:stopped', {
      userId: userData.userId,
      user: userData,
    });
  }

  @SubscribeMessage('share:signal')
  handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; targetId: string; signal: any },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.roomId !== data.roomId) return;

    const targetSocket = Array.from(this.connectedUsers.entries()).find(
      ([, userData]) => userData.userId === data.targetId,
    );

    if (targetSocket) {
      this.server.to(targetSocket[0]).emit('share:signal', {
        fromUserId: userData.userId,
        signal: data.signal,
        user: userData,
      });
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; targetId: string; candidate: any },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.roomId !== data.roomId) return;

    const targetSocket = Array.from(this.connectedUsers.entries()).find(
      ([, d]) => d.userId === data.targetId,
    );

    if (targetSocket) {
      this.server.to(targetSocket[0]).emit('ice-candidate', {
        fromUserId: userData.userId,
        candidate: data.candidate,
      });
    }
  }

  @SubscribeMessage('avatar:update')
  async handleAvatarUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { avatar: string },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData) return;

    userData.avatar = data.avatar;
    this.server.emit('user:avatar-updated', {
      userId: userData.userId,
      avatar: data.avatar,
    });
  }

  @SubscribeMessage('user:typing')
  handleUserTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const userData = this.connectedUsers.get(client.id);
    if (!userData || userData.roomId !== data.roomId) return;

    client.to(`room:${data.roomId}`).emit('user:typing', {
      userId: userData.userId,
      isTyping: data.isTyping,
    });
  }
}
