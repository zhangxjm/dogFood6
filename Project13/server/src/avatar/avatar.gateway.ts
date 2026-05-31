import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/avatar' })
export class AvatarGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  private avatarStates = new Map<string, { socketId: string; userId: string; transform: any; animation: string }>();

  handleConnection(client: Socket) {
    console.log('Avatar gateway client connected:', client.id);
  }

  @SubscribeMessage('avatar_sync')
  handleAvatarSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; transform: any; animation: string },
  ) {
    const state = {
      socketId: client.id,
      userId: data.userId,
      transform: data.transform,
      animation: data.animation || 'idle',
    };
    this.avatarStates.set(client.id, state);

    client.broadcast.emit('avatar_update', {
      socketId: client.id,
      ...state,
    });
  }

  @SubscribeMessage('avatar_transform')
  handleTransformUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transform: any },
  ) {
    const state = this.avatarStates.get(client.id);
    if (state) {
      state.transform = data.transform;
      client.broadcast.emit('avatar_transform_update', {
        socketId: client.id,
        userId: state.userId,
        transform: data.transform,
      });
    }
  }

  @SubscribeMessage('avatar_animation')
  handleAnimationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { animation: string },
  ) {
    const state = this.avatarStates.get(client.id);
    if (state) {
      state.animation = data.animation;
      client.broadcast.emit('avatar_animation_update', {
        socketId: client.id,
        userId: state.userId,
        animation: data.animation,
      });
    }
  }

  @SubscribeMessage('get_avatars')
  handleGetAvatars(@ConnectedSocket() client: Socket) {
    const avatars = Array.from(this.avatarStates.values())
      .filter(a => a.socketId !== client.id);
    client.emit('avatars_list', avatars);
  }
}
