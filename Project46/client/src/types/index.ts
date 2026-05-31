export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  position?: string;
  createdAt?: string;
}

export interface MeetingRoom {
  id: string;
  name: string;
  description?: string;
  type: 'meeting' | 'office' | 'lobby' | 'presentation';
  maxCapacity: number;
  status: 'active' | 'inactive' | 'private';
  sceneData?: string;
  members: RoomMember[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  role: 'owner' | 'moderator' | 'member' | 'guest';
  muted: boolean;
  videoEnabled: boolean;
  position?: string;
  rotation?: string;
  user: User;
  joinedAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  delta?: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'whiteboard';
  creatorId: string;
  roomId?: string;
  creator: User;
  collaborators: DocumentCollaborator[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCollaborator {
  id: string;
  documentId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  cursorPosition?: string;
  selection?: string;
  isActive: boolean;
  user: User;
  joinedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  roomId?: string;
  receiverId?: string;
  type: 'text' | 'image' | 'file' | 'system' | 'emoji';
  content: string;
  isRead: boolean;
  sender: User;
  createdAt: string;
}

export interface DesktopShare {
  id: string;
  sharerId: string;
  roomId: string;
  status: 'active' | 'paused' | 'ended';
  streamId?: string;
  sourceType: 'screen' | 'window' | 'tab';
  width?: number;
  height?: number;
  sharer: User;
  room: MeetingRoom;
  startTime: string;
  endTime?: string;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}
