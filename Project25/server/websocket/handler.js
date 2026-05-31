const WebSocket = require('ws');

function handleWebSocketConnection(ws, req, rooms) {
  console.log('[WS] New WebSocket connection');

  let currentRoom = null;
  let currentUser = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      handleMessage(ws, data, rooms);
    } catch (err) {
      console.error('[WS] Message parsing error:', err);
      ws.send(JSON.stringify({ type: 'error', message: '消息格式错误' }));
    }
  });

  ws.on('close', () => {
    if (currentRoom && currentUser) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.users = room.users.filter(u => u.id !== currentUser.id);
        broadcastToRoom(currentRoom, {
          type: 'user_left',
          user: currentUser,
          users: room.users
        }, rooms);

        if (room.users.length === 0) {
          rooms.delete(currentRoom);
          console.log(`[WS] Room ${currentRoom} deleted (empty)`);
        }
      }
    }
    console.log('[WS] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[WS] WebSocket error:', err);
  });
}

function handleMessage(ws, data, rooms) {
  const { type, payload } = data;

  switch (type) {
    case 'join_room':
      handleJoinRoom(ws, payload, rooms);
      break;
    case 'leave_room':
      handleLeaveRoom(ws, payload, rooms);
      break;
    case 'sync_state':
      handleSyncState(ws, payload, rooms);
      break;
    case 'operation':
      handleOperation(ws, payload, rooms);
      break;
    case 'chat':
      handleChat(ws, payload, rooms);
      break;
    case 'cursor':
      handleCursor(ws, payload, rooms);
      break;
    case 'request_state':
      handleRequestState(ws, payload, rooms);
      break;
    default:
      console.log('[WS] Unknown message type:', type);
  }
}

function handleJoinRoom(ws, payload, rooms) {
  const { roomCode, user } = payload;

  if (!roomCode || !user) {
    ws.send(JSON.stringify({ type: 'error', message: '缺少房间号或用户信息' }));
    return;
  }

  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      code: roomCode,
      users: [],
      state: {
        components: [],
        connections: [],
        operations: []
      }
    });
  }

  const room = rooms.get(roomCode);

  const existingUser = room.users.find(u => u.id === user.id);
  if (existingUser) {
    existingUser.ws = ws;
  } else {
    room.users.push({ ...user, ws });
  }

  ws.roomCode = roomCode;
  ws.userId = user.id;

  ws.send(JSON.stringify({
    type: 'room_joined',
    room: {
      code: roomCode,
      users: room.users.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, avatar: u.avatar })),
      state: room.state
    }
  }));

  broadcastToRoom(roomCode, {
    type: 'user_joined',
    user: user,
    users: room.users.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, avatar: u.avatar }))
  }, rooms, user.id);

  console.log(`[WS] User ${user.username} joined room ${roomCode}`);
}

function handleLeaveRoom(ws, payload, rooms) {
  const { roomCode, user } = payload;
  const room = rooms.get(roomCode);

  if (!room) return;

  room.users = room.users.filter(u => u.id !== user.id);

  broadcastToRoom(roomCode, {
    type: 'user_left',
    user: user,
    users: room.users.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, avatar: u.avatar }))
  }, rooms);

  if (room.users.length === 0) {
    rooms.delete(roomCode);
    console.log(`[WS] Room ${roomCode} deleted`);
  }

  console.log(`[WS] User ${user.username} left room ${roomCode}`);
}

function handleSyncState(ws, payload, rooms) {
  const { roomCode, state, userId } = payload;
  const room = rooms.get(roomCode);

  if (!room) return;

  room.state = { ...room.state, ...state };

  broadcastToRoom(roomCode, {
    type: 'state_updated',
    state: room.state,
    updatedBy: userId
  }, rooms, userId);
}

function handleOperation(ws, payload, rooms) {
  const { roomCode, operation, user } = payload;
  const room = rooms.get(roomCode);

  if (!room) return;

  room.state.operations = room.state.operations || [];
  room.state.operations.push({
    ...operation,
    userId: user.id,
    timestamp: Date.now()
  });

  broadcastToRoom(roomCode, {
    type: 'operation',
    operation,
    user
  }, rooms, user.id);
}

function handleChat(ws, payload, rooms) {
  const { roomCode, message, user } = payload;
  const room = rooms.get(roomCode);

  if (!room) return;

  broadcastToRoom(roomCode, {
    type: 'chat',
    message,
    user,
    timestamp: Date.now()
  }, rooms);
}

function handleCursor(ws, payload, rooms) {
  const { roomCode, position, userId } = payload;
  const room = rooms.get(roomCode);

  if (!room) return;

  broadcastToRoom(roomCode, {
    type: 'cursor_update',
    userId,
    position
  }, rooms, userId);
}

function handleRequestState(ws, payload, rooms) {
  const { roomCode } = payload;
  const room = rooms.get(roomCode);

  if (!room) return;

  ws.send(JSON.stringify({
    type: 'state_sync',
    state: room.state,
    users: room.users.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, avatar: u.avatar }))
  }));
}

function broadcastToRoom(roomCode, data, rooms, excludeUserId = null) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const message = JSON.stringify(data);

  room.users.forEach(user => {
    if (user.ws && user.ws.readyState === WebSocket.OPEN && user.id !== excludeUserId) {
      user.ws.send(message);
    }
  });
}

module.exports = { handleWebSocketConnection };
