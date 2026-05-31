import { createSignal, onMount, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { api } from '../services/api';
import type { MeetingRoom, Document, User } from '../types';

const roomTypeLabels: Record<string, string> = {
  meeting: '会议室',
  office: '办公室',
  lobby: '大厅',
  presentation: '演示厅',
};

const roomTypeColors: Record<string, string> = {
  meeting: '#3b82f6',
  office: '#22c55e',
  lobby: '#f59e0b',
  presentation: '#8b5cf6',
};

const docTypeLabels: Record<string, string> = {
  document: '文档',
  spreadsheet: '表格',
  presentation: '演示',
  whiteboard: '白板',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [rooms, setRooms] = createSignal<MeetingRoom[]>([]);
  const [documents, setDocuments] = createSignal<Document[]>([]);
  const [onlineUsers, setOnlineUsers] = createSignal<User[]>([]);
  const [activeTab, setActiveTab] = createSignal<'rooms' | 'documents'>('rooms');
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const [roomsData, docsData, usersData] = await Promise.all([
        api.get<MeetingRoom[]>('/api/rooms'),
        api.get<Document[]>('/api/documents'),
        api.get<User[]>('/api/users/online'),
      ]);
      setRooms(roomsData);
      setDocuments(docsData);
      setOnlineUsers(usersData);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  });

  async function createRoom() {
    const name = prompt('请输入会议室名称:');
    if (!name) return;

    const type = (prompt('请选择类型 (meeting/office/lobby/presentation):', 'meeting') || 'meeting') as any;
    const capacity = parseInt(prompt('请输入最大容量:', '10') || '10');

    try {
      const room = await api.post<MeetingRoom>('/api/rooms', { name, type, maxCapacity: capacity });
      setRooms((prev) => [room, ...prev]);
    } catch (e: any) {
      alert(e.message || '创建失败');
    }
  }

  async function createDocument() {
    const title = prompt('请输入文档标题:');
    if (!title) return;

    const type = (prompt('请选择类型 (document/spreadsheet/presentation/whiteboard):', 'document') || 'document') as any;

    try {
      const doc = await api.post<Document>('/api/documents', { title, type });
      setDocuments((prev) => [doc, ...prev]);
      navigate(`/document/${doc.id}`);
    } catch (e: any) {
      alert(e.message || '创建失败');
    }
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
        <div class="pulse">加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <aside style={{
        width: '280px',
        background: 'rgba(30, 41, 59, 0.5)',
        'border-right': '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px',
        overflow: 'auto',
      }}>
        <div style={{ 'margin-bottom': '24px' }}>
          <h3 style={{
            'font-size': '14px',
            color: '#94a3b8',
            'margin-bottom': '12px',
            'text-transform': 'uppercase',
            'letter-spacing': '1px',
          }}>在线用户 ({onlineUsers().length})</h3>
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
            <For each={onlineUsers()}>
              {(user) => (
                <div style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  'border-radius': '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}>
                  <div style={{ position: 'relative' }}>
                    <img src={user.avatar} alt={user.nickname} style={{ width: '32px', height: '32px', 'border-radius': '50%' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '10px',
                      height: '10px',
                      background: '#22c55e',
                      border: '2px solid #1e293b',
                      'border-radius': '50%',
                    }} />
                  </div>
                  <div>
                    <div style={{ 'font-size': '13px', color: '#e2e8f0' }}>{user.nickname}</div>
                    <div style={{ 'font-size': '11px', color: '#64748b' }}>{user.username}</div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>

        <div>
          <h3 style={{
            'font-size': '14px',
            color: '#94a3b8',
            'margin-bottom': '12px',
            'text-transform': 'uppercase',
            'letter-spacing': '1px',
          }}>系统统计</h3>
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
              'border-radius': '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
              <div style={{ 'font-size': '24px', 'font-weight': 'bold', color: '#60a5fa' }}>{rooms().length}</div>
              <div style={{ 'font-size': '12px', color: '#94a3b8' }}>会议室数量</div>
            </div>
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
              'border-radius': '12px',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}>
              <div style={{ 'font-size': '24px', 'font-weight': 'bold', color: '#34d399' }}>{documents().length}</div>
              <div style={{ 'font-size': '12px', color: '#94a3b8' }}>文档数量</div>
            </div>
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
              'border-radius': '12px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}>
              <div style={{ 'font-size': '24px', 'font-weight': 'bold', color: '#fbbf24' }}>{onlineUsers().length}</div>
              <div style={{ 'font-size': '12px', color: '#94a3b8' }}>当前在线</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '24px' }}>
          <div>
            <h2 style={{ 'font-size': '24px', 'margin-bottom': '4px' }}>工作台</h2>
            <p style={{ color: '#94a3b8', 'font-size': '14px' }}>欢迎回来，开始您的元宇宙协作之旅</p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '4px',
          'margin-bottom': '20px',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '4px',
          'border-radius': '8px',
          width: 'fit-content',
        }}>
          <button
            onClick={() => setActiveTab('rooms')}
            style={{
              padding: '8px 20px',
              background: activeTab() === 'rooms' ? '#3b82f6' : 'transparent',
              color: activeTab() === 'rooms' ? 'white' : '#94a3b8',
              'border-radius': '6px',
              'font-size': '14px',
              transition: 'all 0.2s',
            }}
          >
            虚拟会议室
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            style={{
              padding: '8px 20px',
              background: activeTab() === 'documents' ? '#3b82f6' : 'transparent',
              color: activeTab() === 'documents' ? 'white' : '#94a3b8',
              'border-radius': '6px',
              'font-size': '14px',
              transition: 'all 0.2s',
            }}
          >
            协同文档
          </button>
        </div>

        {activeTab() === 'rooms' && (
          <div>
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '16px' }}>
              <h3 style={{ 'font-size': '16px' }}>会议室列表</h3>
              <button
                onClick={createRoom}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  'border-radius': '6px',
                  'font-size': '13px',
                  transition: 'all 0.2s',
                }}
              >
                + 创建会议室
              </button>
            </div>

            <div style={{
              display: 'grid',
              'grid-template-columns': 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              <For each={rooms()}>
                {(room) => (
                  <div
                    onClick={() => navigate(`/room/${room.id}`)}
                    class="fade-in"
                    style={{
                      padding: '20px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      'border-radius': '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'start', 'margin-bottom': '12px' }}>
                      <div>
                        <h4 style={{ 'font-size': '16px', 'margin-bottom': '4px' }}>{room.name}</h4>
                        <p style={{ 'font-size': '12px', color: '#94a3b8', 'line-height': '1.5' }}>{room.description || '暂无描述'}</p>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        background: `${roomTypeColors[room.type]}20`,
                        color: roomTypeColors[room.type],
                        'border-radius': '20px',
                        'font-size': '11px',
                      }}>{roomTypeLabels[room.type]}</span>
                    </div>
                    <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          'border-radius': '50%',
                          background: room.members?.length > 0 ? '#22c55e' : '#64748b',
                        }} />
                        <span style={{ 'font-size': '12px', color: '#94a3b8' }}>
                          {room.members?.length || 0} / {room.maxCapacity} 人
                        </span>
                      </div>
                      <span style={{ 'font-size': '12px', color: '#60a5fa' }}>进入 →</span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}

        {activeTab() === 'documents' && (
          <div>
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '16px' }}>
              <h3 style={{ 'font-size': '16px' }}>我的文档</h3>
              <button
                onClick={createDocument}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  'border-radius': '6px',
                  'font-size': '13px',
                  transition: 'all 0.2s',
                }}
              >
                + 创建文档
              </button>
            </div>

            <div style={{
              display: 'grid',
              'grid-template-columns': 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              <For each={documents()}>
                {(doc) => (
                  <div
                    onClick={() => navigate(`/document/${doc.id}`)}
                    class="fade-in"
                    style={{
                      padding: '20px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      'border-radius': '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'start', 'margin-bottom': '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #22c55e, #10b981)',
                        'border-radius': '8px',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        'font-weight': 'bold',
                        'font-size': '18px',
                      }}>
                        {docTypeLabels[doc.type]?.charAt(0) || '文'}
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#34d399',
                        'border-radius': '20px',
                        'font-size': '11px',
                      }}>{docTypeLabels[doc.type]}</span>
                    </div>
                    <h4 style={{ 'font-size': '15px', 'margin-bottom': '8px', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{doc.title}</h4>
                    <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'font-size': '12px', color: '#94a3b8' }}>
                      <span>创建者: {doc.creator?.nickname}</span>
                      <span style={{ color: '#34d399' }}>编辑 →</span>
                    </div>
                    {doc.collaborators?.length > 0 && (
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '4px', 'margin-top': '12px', padding: '8px', background: 'rgba(255, 255, 255, 0.03)', 'border-radius': '6px' }}>
                        <span style={{ 'font-size': '11px', color: '#64748b' }}>协作者:</span>
                        <For each={doc.collaborators?.slice(0, 3)}>
                          {(c) => (
                            <img src={c.user?.avatar} alt={c.user?.nickname} title={c.user?.nickname} style={{ width: '20px', height: '20px', 'border-radius': '50%', border: '2px solid #1e293b' }} />
                          )}
                        </For>
                        {doc.collaborators?.length > 3 && (
                          <span style={{ 'font-size': '11px', color: '#64748b' }}>+{doc.collaborators.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
