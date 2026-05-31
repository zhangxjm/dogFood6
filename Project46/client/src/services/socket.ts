import { io, Socket } from 'socket.io-client';
import { createSignal } from 'solid-js';
import type { User, Message, RoomMember, Document, DesktopShare, Position, Rotation } from '../types';

let socket: Socket | null = null;

const [isConnected, setIsConnected] = createSignal(false);
const [onlineUsers, setOnlineUsers] = createSignal<User[]>([]);
const [roomMembers, setRoomMembers] = createSignal<RoomMember[]>([]);
const [roomMessages, setRoomMessages] = createSignal<Message[]>([]);
const [currentRoomId, setCurrentRoomId] = createSignal<string | null>(null);
const [currentDocumentId, setCurrentDocumentId] = createSignal<string | null>(null);
const [activeShare, setActiveShare] = createSignal<DesktopShare | null>(null);
const [remotePositions, setRemotePositions] = createSignal<Map<string, { position: Position; rotation: Rotation }>>(new Map());
const [remoteCursors, setRemoteCursors] = createSignal<Map<string, any>>(new Map());

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export const socketService = {
  isConnected,
  onlineUsers,
  roomMembers,
  roomMessages,
  currentRoomId,
  currentDocumentId,
  activeShare,
  remotePositions,
  remoteCursors,

  connect() {
    socket?.connect();
    return this;
  },

  init() {
    const token = getCookie('token');
    socket = io({
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('users:list', (users: User[]) => {
      setOnlineUsers(users);
    });

    socket.on('user:online', (data: { userId: string; user: User }) => {
      setOnlineUsers((prev) => {
        const exists = prev.some((u) => u.id === data.userId);
        if (!exists) {
          return [...prev, data.user];
        }
        return prev.map((u) => (u.id === data.userId ? { ...u, status: 'online' } : u));
      });
    });

    socket.on('user:offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== data.userId));
    });

    socket.on('room:joined', (data: { roomId: string; members: RoomMember[]; messages: Message[]; activeShare: DesktopShare }) => {
      setCurrentRoomId(data.roomId);
      setRoomMembers(data.members);
      setRoomMessages(data.messages.reverse());
      setActiveShare(data.activeShare);
      const newPositions = new Map<string, { position: Position; rotation: Rotation }>();
      data.members.forEach((m) => {
        if (m.position && m.rotation) {
          newPositions.set(m.userId, {
            position: JSON.parse(m.position),
            rotation: JSON.parse(m.rotation),
          });
        }
      });
      setRemotePositions(newPositions);
    });

    socket.on('room:left', (data: { roomId: string }) => {
      if (currentRoomId() === data.roomId) {
        setCurrentRoomId(null);
        setRoomMembers([]);
        setRoomMessages([]);
        setActiveShare(null);
        setRemotePositions(new Map());
      }
    });

    socket.on('room:member-joined', (data: { userId: string; user: User; members: RoomMember[] }) => {
      setRoomMembers(data.members);
    });

    socket.on('room:member-left', (data: { userId: string; members: RoomMember[] }) => {
      setRoomMembers(data.members);
      setRemotePositions((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    });

    socket.on('room:user-moved', (data: { userId: string; position: Position; rotation: Rotation; user: User }) => {
      setRemotePositions((prev) => {
        const next = new Map(prev);
        next.set(data.userId, { position: data.position, rotation: data.rotation });
        return next;
      });
    });

    socket.on('room:message', (data: { message: Message; user: User }) => {
      setRoomMessages((prev) => [...prev, data.message]);
    });

    socket.on('share:started', (data: { share: DesktopShare; user: User }) => {
      setActiveShare(data.share);
    });

    socket.on('share:stopped', (data: { userId: string }) => {
      setActiveShare(null);
    });

    socket.on('document:joined', (data: { documentId: string; collaborators: any[] }) => {
      setCurrentDocumentId(data.documentId);
      const newCursors = new Map<string, any>();
      data.collaborators.forEach((c) => {
        if (c.cursorPosition) {
          newCursors.set(c.userId, {
            position: JSON.parse(c.cursorPosition),
            user: c.user,
          });
        }
      });
      setRemoteCursors(newCursors);
    });

    socket.on('document:left', (data: { documentId: string }) => {
      if (currentDocumentId() === data.documentId) {
        setCurrentDocumentId(null);
        setRemoteCursors(new Map());
      }
    });

    socket.on('document:user-joined', (data: { userId: string; collaborators: any[] }) => {
      const newCursors = new Map<string, any>();
      data.collaborators.forEach((c) => {
        if (c.cursorPosition) {
          newCursors.set(c.userId, {
            position: JSON.parse(c.cursorPosition),
            user: c.user,
          });
        }
      });
      setRemoteCursors(newCursors);
    });

    socket.on('document:user-left', (data: { userId: string; collaborators: any[] }) => {
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    });

    socket.on('document:cursor-moved', (data: { userId: string; position: any; user: User }) => {
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.set(data.userId, { position: data.position, user: data.user });
        return next;
      });
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
    });

    return this;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    setIsConnected(false);
    setCurrentRoomId(null);
    setCurrentDocumentId(null);
  },

  joinRoom(roomId: string) {
    socket?.emit('room:join', { roomId });
  },

  leaveRoom(roomId: string) {
    socket?.emit('room:leave', { roomId });
  },

  move(roomId: string, position: Position, rotation: Rotation) {
    socket?.emit('room:move', { roomId, position, rotation });
  },

  sendChat(roomId: string, content: string, type: string = 'text') {
    socket?.emit('room:chat', { roomId, content, type });
  },

  setAudioState(roomId: string, muted: boolean) {
    socket?.emit('room:audio-state', { roomId, muted });
  },

  joinDocument(documentId: string) {
    socket?.emit('document:join', { documentId });
  },

  leaveDocument(documentId: string) {
    socket?.emit('document:leave', { documentId });
  },

  sendDocumentChange(documentId: string, delta: any, content: string) {
    socket?.emit('document:change', { documentId, delta, content });
  },

  sendCursor(documentId: string, position: any, selection?: any) {
    socket?.emit('document:cursor', { documentId, position, selection });
  },

  startShare(roomId: string, streamId: string, sourceType: string, width: number, height: number) {
    socket?.emit('share:start', { roomId, streamId, sourceType, width, height });
  },

  stopShare(roomId: string) {
    socket?.emit('share:stop', { roomId });
  },

  sendSignal(roomId: string, targetId: string, signal: any) {
    socket?.emit('share:signal', { roomId, targetId, signal });
  },

  sendIceCandidate(roomId: string, targetId: string, candidate: any) {
    socket?.emit('ice-candidate', { roomId, targetId, candidate });
  },

  on(event: string, handler: (...args: any[]) => void) {
    socket?.on(event, handler);
    return this;
  },

  off(event: string, handler: (...args: any[]) => void) {
    socket?.off(event, handler);
    return this;
  },

  once(event: string, handler: (...args: any[]) => void) {
    socket?.once(event, handler);
    return this;
  },
};
