import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Button, Input, List, Avatar, Tag, Select, message, Empty } from 'antd';
import {
  VideoCameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraAddOutlined,
  SendOutlined,
  RiseOutlined,
  PlaySquareOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { liveSocket } from '../services/socket';
import { courseAPI } from '../services/api';
import { Course } from '../types';
import { Socket } from 'socket.io-client';

const { Option } = Select;

interface Participant {
  userId: number;
  name: string;
  role: string;
}

interface ChatMessage {
  clientId: string;
  userName: string;
  message: string;
  timestamp: string;
  isSelf?: boolean;
}

const LiveRoom: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const roomId = selectedCourseId ? `course-${selectedCourseId}` : '';

  useEffect(() => {
    loadCourses();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [courseId]);

  const loadCourses = async () => {
    try {
      const data = await courseAPI.getAll();
      const ongoingCourses = data.filter(c => c.status === 'ongoing');
      setCourses(ongoingCourses);
      if (ongoingCourses.length > 0 && !courseId) {
        setSelectedCourseId(ongoingCourses[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const initSocket = () => {
    if (!socketRef.current) {
      socketRef.current = liveSocket.connect();
      setupSocketListeners();
    }
  };

  const setupSocketListeners = () => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('joined-room', (data: { participants: Participant[]; isLive: boolean }) => {
      setParticipants(data.participants);
      setIsLive(data.isLive);
      setIsJoined(true);
      message.success('已加入直播间');
    });

    socket.on('participant-joined', (data: { user: Participant; participants: Participant[] }) => {
      setParticipants(data.participants);
      message.info(`${data.user.name} 加入了直播间`);
    });

    socket.on('participant-left', (data: { participants: Participant[] }) => {
      setParticipants(data.participants);
    });

    socket.on('live-started', () => {
      setIsLive(true);
      message.info('直播已开始');
    });

    socket.on('live-ended', () => {
      setIsLive(false);
      message.info('直播已结束');
    });

    socket.on('new-message', (data: ChatMessage) => {
      setMessages(prev => [...prev, { ...data, isSelf: data.clientId === socket.id }]);
    });

    socket.on('hand-raised', (data: { userName: string }) => {
      message.info(`${data.userName} 举手发言`);
    });

    socket.on('screen-share-started', (data: { userName: string }) => {
      message.info(`${data.userName} 开始共享屏幕`);
    });

    socket.on('screen-share-stopped', () => {
      setIsSharingScreen(false);
    });

    socket.on('receive-offer', async (data: { fromClientId: string; offer: RTCSessionDescriptionInit }) => {
      await handleReceiveOffer(data.fromClientId, data.offer);
    });

    socket.on('receive-answer', async (data: { fromClientId: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionsRef.current.get(data.fromClientId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('receive-ice-candidate', async (data: { fromClientId: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionsRef.current.get(data.fromClientId);
      if (pc && data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });
  };

  const joinRoom = async () => {
    if (!selectedCourseId) {
      message.warning('请选择课程');
      return;
    }

    initSocket();
    
    try {
      await startLocalMedia();
    } catch (error) {
      console.error('Failed to start media:', error);
    }

    const selectedCourse = courses.find(c => c.id.toString() === selectedCourseId);
    liveSocket.joinRoom({
      roomId,
      userId: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      courseId: parseInt(selectedCourseId),
      teacherId: selectedCourse?.teacherId || 0,
    });
  };

  const leaveRoom = () => {
    liveSocket.leaveRoom({ roomId });
    stopLocalMedia();
    setIsJoined(false);
    setParticipants([]);
    setMessages([]);
  };

  const startLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      message.warning('无法访问摄像头和麦克风，将以观看模式加入');
    }
  };

  const stopLocalMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    setIsSharingScreen(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      screenStreamRef.current = stream;
      setIsSharingScreen(true);
      liveSocket.emit('screen-share-started', { roomId, userName: currentUser.name });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
      message.error('屏幕共享失败');
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsSharingScreen(false);
    liveSocket.emit('screen-share-stopped', { roomId });
  };

  const handleReceiveOffer = async (fromClientId: string, offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection(fromClientId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    liveSocket.sendAnswer({ roomId, targetClientId: fromClientId, answer });
  };

  const createPeerConnection = (clientId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        liveSocket.sendIceCandidate({ roomId, targetClientId: clientId, candidate: event.candidate });
      }
    };

    peerConnectionsRef.current.set(clientId, pc);
    return pc;
  };

  const startLive = () => {
    liveSocket.startLive({ roomId });
  };

  const endLive = () => {
    liveSocket.endLive({ roomId });
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    liveSocket.sendMessage({ roomId, message: messageInput, userName: currentUser.name });
    setMessageInput('');
  };

  const raiseHand = () => {
    liveSocket.raiseHand({ roomId, userName: currentUser.name });
  };

  const cleanup = () => {
    stopLocalMedia();
    liveSocket.disconnect();
    socketRef.current = null;
  };

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'admin';

  return (
    <div className="page-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card
            title="直播课堂"
            extra={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {!isJoined ? (
                  <>
                    <Select
                      placeholder="选择课程"
                      style={{ width: 200 }}
                      value={selectedCourseId}
                      onChange={setSelectedCourseId}
                    >
                      {courses.map(c => (
                        <Option key={c.id} value={c.id.toString()}>{c.title}</Option>
                      ))}
                    </Select>
                    <Button type="primary" onClick={joinRoom}>
                      加入直播
                    </Button>
                  </>
                ) : (
                  <Button danger onClick={leaveRoom}>
                    退出直播
                  </Button>
                )}
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={isJoined ? 16 : 24}>
                <div className="live-video-container">
                  {isSharingScreen ? (
                    <video ref={remoteVideoRef} autoPlay playsInline style={{ objectFit: 'contain' }} />
                  ) : (
                    <video ref={remoteVideoRef} autoPlay playsInline />
                  )}
                  {!isLive && isJoined && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      textAlign: 'center',
                    }}>
                      <VideoCameraOutlined style={{ fontSize: 64, opacity: 0.5 }} />
                      <p>等待直播开始...</p>
                    </div>
                  )}
                  {!isJoined && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      textAlign: 'center',
                    }}>
                      <VideoCameraOutlined style={{ fontSize: 64, opacity: 0.5 }} />
                      <p>请加入直播</p>
                    </div>
                  )}
                </div>

                {isJoined && (
                  <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
                      onClick={toggleMute}
                      danger={isMuted}
                    >
                      {isMuted ? '取消静音' : '静音'}
                    </Button>
                    <Button
                      icon={isVideoOff ? <VideoCameraAddOutlined /> : <VideoCameraOutlined />}
                      onClick={toggleVideo}
                      danger={isVideoOff}
                    >
                      {isVideoOff ? '开启视频' : '关闭视频'}
                    </Button>
                    {isSharingScreen ? (
                      <Button icon={<StopOutlined />} onClick={stopScreenShare} danger>
                        停止共享
                      </Button>
                    ) : (
                      <Button icon={<PlaySquareOutlined />} onClick={startScreenShare}>
                        共享屏幕
                      </Button>
                    )}
                    <Button icon={<RiseOutlined />} onClick={raiseHand}>
                      举手
                    </Button>
                    {isTeacher && (
                      isLive ? (
                        <Button danger onClick={endLive}>
                          结束直播
                        </Button>
                      ) : (
                        <Button type="primary" onClick={startLive}>
                          开始直播
                        </Button>
                      )
                    )}
                  </div>
                )}
              </Col>

              {isJoined && (
                <Col xs={24} md={8}>
                  <Card
                    title={`在线成员 (${participants.length})`}
                    size="small"
                    style={{ height: 400, overflow: 'auto' }}
                  >
                    <List
                      dataSource={participants}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar>{item.name[0]}</Avatar>}
                            title={
                              <span>
                                {item.name}
                                <Tag color={item.role === 'teacher' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
                                  {item.role === 'teacher' ? '讲师' : '学员'}
                                </Tag>
                              </span>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              )}
            </Row>

            {isJoined && (
              <Card
                title="互动聊天"
                size="small"
                style={{ marginTop: 16 }}
                bodyStyle={{ padding: 12 }}
              >
                <div style={{ height: 200, overflow: 'auto', marginBottom: 12 }}>
                  {messages.length === 0 ? (
                    <Empty description="暂无消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`chat-message ${msg.isSelf ? 'chat-message-self' : 'chat-message-other'}`}
                      >
                        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                          <strong>{msg.userName}</strong>
                          <span style={{ marginLeft: 8 }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="发送消息..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onPressEnter={sendMessage}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={sendMessage}>
                    发送
                  </Button>
                </div>
              </Card>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="我的摄像头" size="small">
            <div className="live-video-container" style={{ paddingTop: '75%' }}>
              <video ref={localVideoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
              {!localStreamRef.current && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#999',
                  textAlign: 'center',
                }}>
                  摄像头未开启
                </div>
              )}
            </div>
          </Card>

          {selectedCourseId && (
            <Card title="课程信息" size="small" style={{ marginTop: 16 }}>
              {courses.find(c => c.id.toString() === selectedCourseId)?.title || '未选择课程'}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default LiveRoom;