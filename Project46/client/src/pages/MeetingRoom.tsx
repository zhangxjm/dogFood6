import { createSignal, onMount, onCleanup, For, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import * as THREE from 'three';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { authStore } from '../store/authStore';
import type { MeetingRoom, Message, RoomMember, DesktopShare, Position, Rotation } from '../types';

export default function MeetingRoomPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = createSignal<MeetingRoom | null>(null);
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [newMessage, setNewMessage] = createSignal('');
  const [members, setMembers] = createSignal<RoomMember[]>([]);
  const [activeShare, setActiveShare] = createSignal<DesktopShare | null>(null);
  const [isSharing, setIsSharing] = createSignal(false);
  const [muted, setMuted] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [showChat, setShowChat] = createSignal(true);

  let sceneContainer: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let animationId: number;
  let localAvatar: THREE.Group;
  let remoteAvatars = new Map<string, THREE.Group>();
  let myPosition: Position = { x: 0, y: 0, z: 0 };
  let myRotation: Rotation = { x: 0, y: 0, z: 0 };
  const keysPressed = new Set<string>();
  let moveInterval: number;
  let localStream: MediaStream | null = null;
  let videoElement: HTMLVideoElement;

  createEffect(() => {
    const s = socketService.activeShare();
    if (s) setActiveShare(s);
  });

  createEffect(() => {
    const m = socketService.roomMembers();
    if (m.length > 0) setMembers(m);
  });

  createEffect(() => {
    const msg = socketService.roomMessages();
    if (msg.length > 0) setMessages(msg);
  });

  onMount(async () => {
    try {
      const roomData = await api.get<MeetingRoom>(`/api/rooms/${params.id}`);
      setRoom(roomData);

      socketService.joinRoom(params.id);

      init3DScene();
      setupControls();

      moveInterval = window.setInterval(updatePosition, 100);

      socketService.on('document:changed', handleDocChange);
      socketService.on('share:started', handleShareStarted);
      socketService.on('share:stopped', handleShareStopped);
    } catch (e) {
      console.error('Failed to load room:', e);
    } finally {
      setLoading(false);
    }
  });

  onCleanup(() => {
    socketService.leaveRoom(params.id);
    socketService.off('document:changed', handleDocChange);
    socketService.off('share:started', handleShareStarted);
    socketService.off('share:stopped', handleShareStopped);
    clearInterval(moveInterval);
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) renderer.dispose();
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  });

  function init3DScene() {
    const width = sceneContainer.clientWidth;
    const height = sceneContainer.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    scene.fog = new THREE.Fog(0x1e293b, 20, 50);

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    sceneContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(40, 40, 0x475569, 0x334155);
    scene.add(gridHelper);

    createConferenceTable();
    createChairs();
    createWalls();
    localAvatar = createAvatar(authStore.user()?.nickname || '我', '#3b82f6');
    scene.add(localAvatar);

    animate();
    window.addEventListener('resize', onWindowResize);
  }

  function createConferenceTable() {
    const tableGroup = new THREE.Group();

    const tableTopGeometry = new THREE.BoxGeometry(8, 0.3, 3);
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
    tableTop.position.y = 1;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const positions = [
      [-3.5, 0.5, -1.2], [3.5, 0.5, -1.2],
      [-3.5, 0.5, 1.2], [3.5, 0.5, 1.2],
    ];
    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    scene.add(tableGroup);
  }

  function createChairs() {
    const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.5 });
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 });

    const chairPositions = [
      [-2.5, 0, -2.5], [0, 0, -2.5], [2.5, 0, -2.5],
      [-2.5, 0, 2.5], [0, 0, 2.5], [2.5, 0, 2.5],
    ];

    chairPositions.forEach(pos => {
      const chair = new THREE.Group();

      const seatGeometry = new THREE.BoxGeometry(1.2, 0.15, 1.2);
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.y = 0.6;
      seat.castShadow = true;
      chair.add(seat);

      const backGeometry = new THREE.BoxGeometry(1.2, 1, 0.15);
      const back = new THREE.Mesh(backGeometry, chairMaterial);
      back.position.set(0, 1.1, pos[2] > 0 ? -0.5 : 0.5);
      back.castShadow = true;
      chair.add(back);

      const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
      const legPositions = [
        [-0.5, 0.3, -0.5], [0.5, 0.3, -0.5],
        [-0.5, 0.3, 0.5], [0.5, 0.3, 0.5],
      ];
      legPositions.forEach(lp => {
        const leg = new THREE.Mesh(legGeometry, chairMaterial);
        leg.position.set(lp[0], lp[1], lp[2]);
        leg.castShadow = true;
        chair.add(leg);
      });

      chair.position.set(pos[0], pos[1], pos[2]);
      chair.rotation.y = pos[2] > 0 ? Math.PI : 0;
      scene.add(chair);
    });
  }

  function createWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 0.3), wallMaterial);
    backWall.position.set(0, 4, -20);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 0.3), wallMaterial);
    frontWall.position.set(0, 4, 20);
    frontWall.receiveShadow = true;
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 40), wallMaterial);
    leftWall.position.set(-20, 4, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 40), wallMaterial);
    rightWall.position.set(20, 4, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    const screenGeometry = new THREE.PlaneGeometry(8, 4.5);
    const screenMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x1e293b });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 4, -19.8);
    scene.add(screen);

    const screenFrameGeometry = new THREE.BoxGeometry(8.5, 5, 0.2);
    const screenFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const screenFrame = new THREE.Mesh(screenFrameGeometry, screenFrameMaterial);
    screenFrame.position.set(0, 4, -19.7);
    scene.add(screenFrame);
  }

  function createAvatar(name: string, color: string): THREE.Group {
    const avatar = new THREE.Group();

    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: parseInt(color.slice(1), 16), roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    avatar.add(body);

    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.6 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.1;
    head.castShadow = true;
    avatar.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 2.15, 0.3);
    avatar.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 2.15, 0.3);
    avatar.add(rightEye);

    return avatar;
  }

  function setupControls() {
    window.addEventListener('keydown', (e) => {
      keysPressed.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      keysPressed.delete(e.key.toLowerCase());
    });
  }

  function updatePosition() {
    const speed = 0.15;
    let moved = false;

    if (keysPressed.has('w') || keysPressed.has('arrowup')) {
      myPosition.z -= speed;
      moved = true;
    }
    if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
      myPosition.z += speed;
      moved = true;
    }
    if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
      myPosition.x -= speed;
      moved = true;
    }
    if (keysPressed.has('d') || keysPressed.has('arrowright')) {
      myPosition.x += speed;
      moved = true;
    }

    myPosition.x = Math.max(-18, Math.min(18, myPosition.x));
    myPosition.z = Math.max(-18, Math.min(18, myPosition.z));

    if (localAvatar) {
      localAvatar.position.set(myPosition.x, 0, myPosition.z);
    }

    const remotePositions = socketService.remotePositions();
    remotePositions.forEach((data, userId) => {
      if (userId === authStore.user()?.id) return;

      if (!remoteAvatars.has(userId)) {
        const member = members().find(m => m.userId === userId);
        const colors = ['#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
        const colorIndex = userId.charCodeAt(0) % colors.length;
        const avatar = createAvatar(member?.user.nickname || '用户', colors[colorIndex]);
        remoteAvatars.set(userId, avatar);
        scene.add(avatar);
      }

      const avatar = remoteAvatars.get(userId)!;
      avatar.position.set(data.position.x, 0, data.position.z);
    });

    remoteAvatars.forEach((avatar, userId) => {
      if (!remotePositions.has(userId) && userId !== authStore.user()?.id) {
        scene.remove(avatar);
        remoteAvatars.delete(userId);
      }
    });

    if (moved && socketService.isConnected()) {
      socketService.move(params.id, myPosition, myRotation);
    }
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (camera && localAvatar) {
      const targetX = localAvatar.position.x;
      const targetZ = localAvatar.position.z + 15;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      camera.lookAt(localAvatar.position.x, 1, localAvatar.position.z);
    }

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    if (!sceneContainer || !camera || !renderer) return;
    const width = sceneContainer.clientWidth;
    const height = sceneContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function handleDocChange(data: any) {
    console.log('Document changed:', data);
  }

  function handleShareStarted(data: { share: DesktopShare }) {
    setActiveShare(data.share);
  }

  function handleShareStopped() {
    setActiveShare(null);
    setIsSharing(false);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
  }

  async function startScreenShare() {
    try {
      localStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080 },
        audio: false,
      });

      if (videoElement) {
        videoElement.srcObject = localStream;
      }

      const videoTrack = localStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      socketService.startShare(
        params.id,
        'stream-' + Date.now(),
        'screen',
        settings.width || 1920,
        settings.height || 1080,
      );

      setIsSharing(true);

      localStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });
    } catch (e: any) {
      console.error('Failed to start screen share:', e);
      alert('屏幕共享失败: ' + e.message);
    }
  }

  function stopScreenShare() {
    socketService.stopShare(params.id);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    setIsSharing(false);
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }

  function sendMessage() {
    if (!newMessage().trim()) return;
    socketService.sendChat(params.id, newMessage().trim());
    setNewMessage('');
  }

  function toggleMute() {
    setMuted(!muted());
    socketService.setAudioState(params.id, !muted());
  }

  function leaveRoom() {
    navigate('/');
  }

  if (loading()) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-size': '18px',
      }}>
        <div class="pulse">正在进入会议室...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
      <div ref={(el) => (sceneContainer = el!)} style={{ flex: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
          'z-index': 10,
        }}>
          <div style={{
            padding: '12px 20px',
            background: 'rgba(15, 23, 42, 0.9)',
            'border-radius': '12px',
            'backdrop-filter': 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <h3 style={{ 'font-size': '16px', 'margin-bottom': '4px' }}>{room()?.name}</h3>
            <p style={{ 'font-size': '12px', color: '#94a3b8' }}>
              {members().length} 人在线 · 使用 WASD 或方向键移动
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowChat(!showChat())}
              style={{
                padding: '10px 16px',
                background: showChat() ? '#3b82f6' : 'rgba(30, 41, 59, 0.9)',
                color: 'white',
                'border-radius': '8px',
                'font-size': '13px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              💬 聊天 {messages().length > 0 && `(${messages().length})`}
            </button>
            <button
              onClick={muted() ? toggleMute : toggleMute}
              style={{
                padding: '10px 16px',
                background: muted() ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)',
                color: 'white',
                'border-radius': '8px',
                'font-size': '13px',
              }}
            >
              {muted() ? '🔇 已静音' : '🎤 麦克风'}
            </button>
            <button
              onClick={isSharing() ? stopScreenShare : startScreenShare}
              style={{
                padding: '10px 16px',
                background: isSharing() ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)',
                color: 'white',
                'border-radius': '8px',
                'font-size': '13px',
              }}
            >
              {isSharing() ? '📺 停止共享' : '🖥️ 共享屏幕'}
            </button>
            <button
              onClick={leaveRoom}
              style={{
                padding: '10px 16px',
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                'border-radius': '8px',
                'font-size': '13px',
              }}
            >
              🚪 离开
            </button>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          left: '16px',
          bottom: '16px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.9)',
          'border-radius': '12px',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          'z-index': 10,
        }}>
          <h4 style={{ 'font-size': '13px', 'margin-bottom': '8px', color: '#94a3b8' }}>参会人员 ({members().length})</h4>
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '6px' }}>
            <For each={members()}>
              {(member) => (
                <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                  <img src={member.user.avatar} alt={member.user.nickname} style={{ width: '24px', height: '24px', 'border-radius': '50%' }} />
                  <span style={{ 'font-size': '12px', color: '#e2e8f0' }}>
                    {member.user.nickname}
                    {member.userId === authStore.user()?.id && ' (我)'}
                  </span>
                  {member.muted && <span style={{ 'font-size': '10px', color: '#ef4444' }}>🔇</span>}
                </div>
              )}
            </For>
          </div>
        </div>

        {(activeShare() || isSharing()) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            'max-width': '900px',
            'aspect-ratio': '16/9',
            background: '#000',
            'border-radius': '12px',
            overflow: 'hidden',
            'box-shadow': '0 25px 50px rgba(0, 0, 0, 0.5)',
            'z-index': 20,
          }}>
            <video
              ref={(el) => (videoElement = el!)}
              autoplay
              playsinline
              muted
              style={{ width: '100%', height: '100%', 'object-fit': 'contain', background: '#000' }}
            />
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              'border-radius': '20px',
              'font-size': '12px',
              display: 'flex',
              'align-items': 'center',
              gap: '6px',
            }}>
              <span class="pulse" style={{ width: '8px', height: '8px', background: 'white', 'border-radius': '50%' }} />
              正在共享屏幕 - {isSharing() ? '您的屏幕' : activeShare()?.sharer.nickname}
            </div>
          </div>
        )}
      </div>

      {showChat() && (
        <div style={{
          width: '320px',
          background: 'rgba(30, 41, 59, 0.95)',
          'border-left': '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          'flex-direction': 'column',
          'backdrop-filter': 'blur(10px)',
        }}>
          <div style={{
            padding: '16px',
            'border-bottom': '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <h3 style={{ 'font-size': '16px' }}>聊天室</h3>
          </div>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            display: 'flex',
            'flex-direction': 'column',
            gap: '12px',
          }}>
            <For each={messages()}>
              {(msg) => (
                <div class="fade-in" style={{
                  display: 'flex',
                  gap: '10px',
                  'align-items': 'flex-start',
                  ...(msg.senderId === authStore.user()?.id ? { 'flex-direction': 'row-reverse' } : {}),
                }}>
                  <img src={msg.sender.avatar} alt={msg.sender.nickname} style={{ width: '32px', height: '32px', 'border-radius': '50%' }} />
                  <div style={{
                    'max-width': '70%',
                    ...(msg.senderId === authStore.user()?.id ? { 'align-items': 'flex-end' } : {}),
                  }}>
                    <div style={{
                      'font-size': '11px',
                      color: '#64748b',
                      'margin-bottom': '4px',
                      ...(msg.senderId === authStore.user()?.id ? { 'text-align': 'right' } : {}),
                    }}>
                      {msg.sender.nickname}
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      'border-radius': '12px',
                      'font-size': '13px',
                      'line-height': '1.5',
                      background: msg.senderId === authStore.user()?.id
                        ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: '#e2e8f0',
                      'word-break': 'break-word',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )}
            </For>
            {messages().length === 0 && (
              <div style={{
                'text-align': 'center',
                color: '#64748b',
                'font-size': '13px',
                padding: '40px 0',
              }}>
                暂无消息，发送第一条消息吧！
              </div>
            )}
          </div>

          <div style={{
            padding: '12px',
            'border-top': '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '8px',
          }}>
            <input
              type="text"
              value={newMessage()}
              onInput={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入消息..."
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                'border-radius': '8px',
                color: '#e2e8f0',
                'font-size': '13px',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage().trim()}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                color: 'white',
                'border-radius': '8px',
                'font-size': '13px',
                cursor: newMessage().trim() ? 'pointer' : 'not-allowed',
                opacity: newMessage().trim() ? 1 : 0.5,
              }}
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
