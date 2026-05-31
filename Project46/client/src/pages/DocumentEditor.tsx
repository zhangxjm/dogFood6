import { createSignal, onMount, onCleanup, For, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { marked } from 'marked';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { authStore } from '../store/authStore';
import type { Document, DocumentCollaborator } from '../types';

export default function DocumentEditor() {
  const params = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = createSignal<Document | null>(null);
  const [content, setContent] = createSignal('');
  const [title, setTitle] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [activeCollaborators, setActiveCollaborators] = createSignal<DocumentCollaborator[]>([]);
  const [viewMode, setViewMode] = createSignal<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = createSignal(false);

  let textareaRef: HTMLTextAreaElement;
  let saveTimeout: number;
  let cursorTimeout: number;

  createEffect(() => {
    const cursors = socketService.remoteCursors();
    const collabs = activeCollaborators();
    if (cursors.size > 0 && collabs.length === 0) {
      const active: DocumentCollaborator[] = [];
      cursors.forEach((data, userId) => {
        active.push({
          id: 'cursor-' + userId,
          documentId: params.id,
          userId,
          role: 'editor',
          isActive: true,
          cursorPosition: JSON.stringify(data.position),
          user: data.user,
          joinedAt: new Date().toISOString(),
        });
      });
      setActiveCollaborators(active);
    }
  });

  onMount(async () => {
    try {
      const doc = await api.get<Document>(`/api/documents/${params.id}`);
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content || '');

      socketService.joinDocument(params.id);

      socketService.on('document:changed', handleDocumentChanged);
      socketService.on('document:user-joined', handleUserJoined);
      socketService.on('document:user-left', handleUserLeft);
      socketService.on('document:cursor-moved', handleCursorMoved);

      const active = await api.get<DocumentCollaborator[]>(`/api/documents/${params.id}/collaborators/active`);
      setActiveCollaborators(active);
    } catch (e) {
      console.error('Failed to load document:', e);
    } finally {
      setLoading(false);
    }
  });

  onCleanup(() => {
    socketService.leaveDocument(params.id);
    socketService.off('document:changed', handleDocumentChanged);
    socketService.off('document:user-joined', handleUserJoined);
    socketService.off('document:user-left', handleUserLeft);
    socketService.off('document:cursor-moved', handleCursorMoved);
    if (saveTimeout) clearTimeout(saveTimeout);
    if (cursorTimeout) clearTimeout(cursorTimeout);
  });

  function handleDocumentChanged(data: { delta: any; content: string; userId: string }) {
    if (data.userId !== authStore.user()?.id) {
      setContent(data.content);
    }
  }

  function handleUserJoined(data: { collaborators: DocumentCollaborator[] }) {
    setActiveCollaborators(data.collaborators);
  }

  function handleUserLeft(data: { collaborators: DocumentCollaborator[] }) {
    setActiveCollaborators(data.collaborators);
  }

  function handleCursorMoved(data: { userId: string; position: any; user: any }) {
    setActiveCollaborators((prev) => {
      const exists = prev.some(c => c.userId === data.userId);
      if (exists) {
        return prev.map(c => c.userId === data.userId
          ? { ...c, cursorPosition: JSON.stringify(data.position), user: data.user }
          : c
        );
      }
      return [...prev, {
        id: 'cursor-' + data.userId,
        documentId: params.id,
        userId: data.userId,
        role: 'editor',
        isActive: true,
        cursorPosition: JSON.stringify(data.position),
        user: data.user,
        joinedAt: new Date().toISOString(),
      }];
    });
  }

  function handleContentChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    const newContent = target.value;
    setContent(newContent);

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(() => {
      saveDocument(newContent);
    }, 1000);

    emitCursorPosition(target);
    socketService.sendDocumentChange(params.id, { ops: [] }, newContent);
  }

  function handleTitleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setTitle(target.value);

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(() => {
      saveDocument(content(), target.value);
    }, 1000);
  }

  async function saveDocument(newContent: string, newTitle?: string) {
    setIsSaving(true);
    try {
      await api.put(`/api/documents/${params.id}`, {
        title: newTitle || title(),
        content: newContent,
      });
      setDocument((prev) => prev ? { ...prev, title: newTitle || prev.title, content: newContent } : null);
    } catch (e) {
      console.error('Failed to save:', e);
    } finally {
      setIsSaving(false);
    }
  }

  function emitCursorPosition(textarea: HTMLTextAreaElement) {
    if (cursorTimeout) clearTimeout(cursorTimeout);
    cursorTimeout = window.setTimeout(() => {
      const position = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        top: textarea.scrollTop,
      };
      socketService.sendCursor(params.id, position);
    }, 100);
  }

  function handleKeyUp(e: KeyboardEvent) {
    emitCursorPosition(e.target as HTMLTextAreaElement);
  }

  function handleClick(e: MouseEvent) {
    emitCursorPosition(e.target as HTMLTextAreaElement);
  }

  async function addCollaborator() {
    const username = prompt('请输入协作者的用户名:');
    if (!username) return;

    try {
      const users = await api.get<User[]>('/api/users');
      const targetUser = users.find((u: any) => u.username === username);
      if (!targetUser) {
        alert('用户不存在');
        return;
      }

      await api.post(`/api/documents/${params.id}/collaborators`, {
        userId: targetUser.id,
        role: 'editor',
      });

      alert('协作者添加成功');
    } catch (e: any) {
      alert(e.message || '添加失败');
    }
  }

  function goBack() {
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
        <div class="pulse">加载文档中...</div>
      </div>
    );
  }

  const renderMarkdown = () => {
    try {
      return marked(content(), { breaks: true, gfm: true });
    } catch {
      return content();
    }
  };

  const userColors: Record<string, string> = {};
  function getUserColor(userId: string) {
    if (!userColors[userId]) {
      const colors = ['#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];
      userColors[userId] = colors[Object.keys(userColors).length % colors.length];
    }
    return userColors[userId];
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', 'flex-direction': 'column' }}>
      <div style={{
        height: '60px',
        background: 'rgba(30, 41, 59, 0.95)',
        'border-bottom': '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
          <button
            onClick={goBack}
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              'border-radius': '6px',
              'font-size': '13px',
              transition: 'all 0.2s',
            }}
          >
            ← 返回
          </button>
          <div style={{
            display: 'flex',
            'align-items': 'center',
            gap: '12px',
            padding: '8px 0',
          }}>
            <span style={{
              padding: '4px 10px',
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#34d399',
              'border-radius': '20px',
              'font-size': '11px',
            }}>协同编辑</span>
            {isSaving() && (
              <span class="pulse" style={{ 'font-size': '12px', color: '#64748b' }}>正在保存...</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            'align-items': 'center',
            gap: '4px',
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            'border-radius': '20px',
          }}>
            <For each={activeCollaborators().filter(c => c.userId !== authStore.user()?.id).slice(0, 5)}>
              {(collab) => (
                <div
                  title={collab.user?.nickname}
                  style={{
                    position: 'relative',
                    width: '28px',
                    height: '28px',
                    'border-radius': '50%',
                    border: `2px solid ${getUserColor(collab.userId)}`,
                    overflow: 'hidden',
                    'margin-left': '-8px',
                  }}
                >
                  <img src={collab.user?.avatar} alt={collab.user?.nickname} style={{ width: '100%', height: '100%' }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '8px',
                    height: '8px',
                    background: '#22c55e',
                    border: '2px solid #1e293b',
                    'border-radius': '50%',
                  }} />
                </div>
              )}
            </For>
            {activeCollaborators().filter(c => c.userId !== authStore.user()?.id).length === 0 && (
              <span style={{ 'font-size': '11px', color: '#64748b' }}>暂无其他协作者</span>
            )}
          </div>

          <button
            onClick={addCollaborator}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              color: 'white',
              'border-radius': '6px',
              'font-size': '13px',
            }}
          >
            + 邀请协作
          </button>

          <div style={{
            display: 'flex',
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '4px',
            'border-radius': '8px',
            gap: '4px',
          }}>
            <button
              onClick={() => setViewMode('edit')}
              style={{
                padding: '6px 14px',
                background: viewMode() === 'edit' ? '#3b82f6' : 'transparent',
                color: viewMode() === 'edit' ? 'white' : '#94a3b8',
                'border-radius': '6px',
                'font-size': '13px',
              }}
            >
              编辑
            </button>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                padding: '6px 14px',
                background: viewMode() === 'preview' ? '#3b82f6' : 'transparent',
                color: viewMode() === 'preview' ? 'white' : '#94a3b8',
                'border-radius': '6px',
                'font-size': '13px',
              }}
            >
              预览
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <aside style={{
          width: '240px',
          background: 'rgba(30, 41, 59, 0.3)',
          'border-right': '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
          overflow: 'auto',
        }}>
          <div style={{ 'margin-bottom': '24px' }}>
            <h4 style={{
              'font-size': '12px',
              color: '#94a3b8',
              'margin-bottom': '12px',
              'text-transform': 'uppercase',
              'letter-spacing': '1px',
            }}>文档信息</h4>
            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              'border-radius': '8px',
              'font-size': '12px',
            }}>
              <div style={{ 'margin-bottom': '8px' }}>
                <span style={{ color: '#64748b' }}>创建者:</span>
                <span style={{ color: '#e2e8f0', 'margin-left': '8px' }}>{document()?.creator.nickname}</span>
              </div>
              <div style={{ 'margin-bottom': '8px' }}>
                <span style={{ color: '#64748b' }}>类型:</span>
                <span style={{ color: '#e2e8f0', 'margin-left': '8px' }}>
                  {document()?.type === 'document' ? '文档' :
                   document()?.type === 'spreadsheet' ? '表格' :
                   document()?.type === 'presentation' ? '演示' : '白板'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>更新时间:</span>
                <div style={{ color: '#e2e8f0', 'font-size': '11px', 'margin-top': '4px' }}>
                  {document()?.updatedAt ? new Date(document().updatedAt).toLocaleString('zh-CN') : '-'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{
              'font-size': '12px',
              color: '#94a3b8',
              'margin-bottom': '12px',
              'text-transform': 'uppercase',
              'letter-spacing': '1px',
            }}>协作者 ({activeCollaborators().length})</h4>
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
              <For each={activeCollaborators()}>
                {(collab) => (
                  <div style={{
                    display: 'flex',
                    'align-items': 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    'border-radius': '8px',
                  }}>
                    <div style={{ position: 'relative' }}>
                      <img src={collab.user?.avatar} alt={collab.user?.nickname} style={{ width: '28px', height: '28px', 'border-radius': '50%' }} />
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '8px',
                        height: '8px',
                        background: collab.isActive ? '#22c55e' : '#64748b',
                        border: '2px solid #1e293b',
                        'border-radius': '50%',
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        'font-size': '12px',
                        color: '#e2e8f0',
                        overflow: 'hidden',
                        'text-overflow': 'ellipsis',
                        'white-space': 'nowrap',
                      }}>
                        {collab.user?.nickname}
                        {collab.userId === authStore.user()?.id && ' (我)'}
                      </div>
                      <div style={{
                        'font-size': '10px',
                        color: getUserColor(collab.userId),
                      }}>
                        {collab.role === 'owner' ? '所有者' : collab.role === 'editor' ? '编辑者' : '查看者'}
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', 'flex-direction': 'column', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 32px',
            'border-bottom': '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <input
              type="text"
              value={title()}
              onInput={handleTitleChange}
              placeholder="输入文档标题..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#e2e8f0',
                'font-size': '24px',
                'font-weight': '600',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
            {viewMode() === 'edit' ? (
              <div style={{ position: 'relative', height: '100%' }}>
                <textarea
                  ref={(el) => (textareaRef = el!)}
                  value={content()}
                  onInput={handleContentChange}
                  onKeyUp={handleKeyUp}
                  onClick={handleClick}
                  onScroll={handleClick as any}
                  placeholder="开始编写内容，支持 Markdown 格式..."
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '32px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0',
                    'font-size': '15px',
                    'line-height': '1.8',
                    'font-family': "'SF Mono', Monaco, 'Cascadia Code', monospace",
                    outline: 'none',
                    resize: 'none',
                  }}
                />
                <For each={activeCollaborators().filter(c => c.userId !== authStore.user()?.id && c.cursorPosition)}>
                  {(collab) => {
                    const cursor = collab.cursorPosition ? JSON.parse(collab.cursorPosition) : null;
                    if (!cursor) return null;
                    return (
                      <div
                        style={{
                          position: 'absolute',
                          left: '32px',
                          top: `${32 + (cursor.top || 0)}px`,
                          display: 'flex',
                          'align-items': 'center',
                          gap: '4px',
                          pointerEvents: 'none',
                          'z-index': 10,
                        }}
                      >
                        <div style={{
                          width: '2px',
                          height: '20px',
                          background: getUserColor(collab.userId),
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                        <span style={{
                          padding: '2px 6px',
                          background: getUserColor(collab.userId),
                          color: 'white',
                          'font-size': '10px',
                          'border-radius': '3px',
                          'white-space': 'nowrap',
                        }}>
                          {collab.user?.nickname}
                        </span>
                      </div>
                    );
                  }}
                </For>
              </div>
            ) : (
              <div
                class="markdown-body"
                style={{
                  padding: '32px',
                  'line-height': '1.8',
                  'font-size': '15px',
                  color: '#e2e8f0',
                }}
                innerHTML={renderMarkdown() as string}
              />
            )}
          </div>
        </main>
      </div>

      <style>{`
        .markdown-body h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.67em 0;
          padding-bottom: 0.3em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
        }
        .markdown-body h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          color: #f1f5f9;
        }
        .markdown-body h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          color: #f1f5f9;
        }
        .markdown-body p {
          margin: 0.8em 0;
        }
        .markdown-body code {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        }
        .markdown-body pre {
          background: rgba(15, 23, 42, 0.8);
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .markdown-body pre code {
          background: transparent;
          padding: 0;
        }
        .markdown-body blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          margin: 1em 0;
          color: #94a3b8;
          background: rgba(59, 130, 246, 0.05);
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
        }
        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        .markdown-body th, .markdown-body td {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          text-align: left;
        }
        .markdown-body th {
          background: rgba(255, 255, 255, 0.03);
          font-weight: 600;
        }
        .markdown-body tr:nth-child(even) {
          background: rgba(255, 255, 255, 0.02);
        }
        .markdown-body a {
          color: #60a5fa;
          text-decoration: none;
        }
        .markdown-body a:hover {
          text-decoration: underline;
        }
        .markdown-body ul, .markdown-body ol {
          padding-left: 2em;
          margin: 0.8em 0;
        }
        .markdown-body li {
          margin: 0.4em 0;
        }
        .markdown-body hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}
