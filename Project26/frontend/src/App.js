import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [keyLength, setKeyLength] = useState(256);
  const [generatedKey, setGeneratedKey] = useState(null);
  
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [sender, setSender] = useState('Alice');
  const [receiver, setReceiver] = useState('Bob');
  const [eavesdropProb, setEavesdropProb] = useState(0.3);
  const [transmitResult, setTransmitResult] = useState(null);
  
  const [checkKeyInput, setCheckKeyInput] = useState('');
  const [checkResults, setCheckResults] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchKeys();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchKeys = async () => {
    try {
      const res = await axios.get(`${API_BASE}/keys`);
      if (res.data.success) {
        setKeys(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch keys:', err);
    }
  };

  const handleGenerateKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${API_BASE}/keys/generate`, { length: keyLength });
      if (res.data.success) {
        setGeneratedKey(res.data.data);
        setSuccess('密钥生成成功！');
        fetchStats();
        fetchKeys();
      }
    } catch (err) {
      setError('密钥生成失败: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const handleTransmitKey = async () => {
    if (!selectedKeyId) {
      setError('请选择一个密钥');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${API_BASE}/keys/transmit`, {
        key_id: selectedKeyId,
        sender,
        receiver,
        eavesdrop_prob: eavesdropProb
      });
      if (res.data.success) {
        setTransmitResult(res.data.data);
        setSuccess(res.data.data.success ? '传输成功！' : '传输检测到异常！');
        fetchStats();
        fetchKeys();
      }
    } catch (err) {
      setError('传输失败: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const handleCheckKey = async () => {
    if (!checkKeyInput) {
      setError('请输入密钥');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/keys/check`, { key: checkKeyInput });
      if (res.data.success) {
        setCheckResults(res.data.data);
      }
    } catch (err) {
      setError('检测失败: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'generated':
      case 'transmitted':
        return <span className="status-badge status-success">成功</span>;
      case 'compromised':
        return <span className="status-badge status-danger">被窃听</span>;
      case 'failed':
        return <span className="status-badge status-warning">失败</span>;
      default:
        return <span className="status-badge status-info">{status}</span>;
    }
  };

  const chartData = stats ? [
    { name: '总密钥', value: stats.total_keys, color: '#00d4ff' },
    { name: '成功', value: stats.successful_keys, color: '#10b981' },
    { name: '被窃听', value: stats.compromised_keys, color: '#ef4444' },
    { name: '失败', value: stats.failed_keys, color: '#f59e0b' },
  ] : [];

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span>🔐</span>
          量子通信密钥分发模拟系统
        </h1>
        <p>基于 BB84 协议的量子密钥分发（QKD）模拟平台 - 实现安全的量子加密通信</p>
      </header>

      <main className="main-content">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 数据概览
          </button>
          <button className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>
            🔑 密钥生成
          </button>
          <button className={`tab-btn ${activeTab === 'transmit' ? 'active' : ''}`} onClick={() => setActiveTab('transmit')}>
            📡 传输模拟
          </button>
          <button className={`tab-btn ${activeTab === 'check' ? 'active' : ''}`} onClick={() => setActiveTab('check')}>
            🔍 安全检测
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            📜 历史记录
          </button>
        </div>

        {error && <div className="error-message">❌ {error}</div>}
        {success && <div className="success-message">✅ {success}</div>}

        {activeTab === 'dashboard' && stats && (
          <Dashboard stats={stats} keys={keys} chartData={chartData} />
        )}

        {activeTab === 'generate' && (
          <div className="card">
            <h2>🔑 量子密钥生成 (BB84 协议)</h2>
            <div className="diagram-container">
              <div className="qkd-diagram">
                <div className="entity alice">
                  <div className="entity-icon">👩‍💻</div>
                  <div className="entity-name">Alice (发送方)</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>发送量子比特</div>
                </div>
                <div className="arrow">
                  <div className="arrow-line"></div>
                  <div className="quantum-channel">量子信道</div>
                </div>
                <div className="entity bob">
                  <div className="entity-icon">👨‍💻</div>
                  <div className="entity-name">Bob (接收方)</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>接收并测量</div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>密钥长度 (比特)</label>
              <input 
                type="number" 
                value={keyLength} 
                onChange={(e) => setKeyLength(parseInt(e.target.value) || 256)}
                min="64"
                max="2048"
              />
            </div>

            <button className="btn btn-primary" onClick={handleGenerateKey} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: '20px', height: '20px' }}></span> : '⚡ 生成量子密钥'}
            </button>

            {generatedKey && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>生成结果</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>密钥ID</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{generatedKey.id}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>有效长度</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{generatedKey.length} bits</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>错误率</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: generatedKey.error_rate < 0.1 ? '#10b981' : '#f59e0b' }}>
                      {(generatedKey.error_rate * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>生成的密钥 (十六进制):</div>
                <div className="key-display">{generatedKey.key}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transmit' && (
          <div className="card">
            <h2>📡 量子密钥传输模拟</h2>
            <div className="diagram-container">
              <div className="qkd-diagram">
                <div className="entity alice">
                  <div className="entity-icon">👩‍💻</div>
                  <div className="entity-name">Alice</div>
                </div>
                <div className="arrow">
                  <div className="arrow-line"></div>
                  <div className="quantum-channel">量子信道</div>
                </div>
                <div className="entity eve" style={{ position: 'relative' }}>
                  <div className="entity-icon">🕵️</div>
                  <div className="entity-name">Eve (窃听者)</div>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>可能存在</div>
                </div>
                <div className="arrow">
                  <div className="arrow-line"></div>
                </div>
                <div className="entity bob">
                  <div className="entity-icon">👨‍💻</div>
                  <div className="entity-name">Bob</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>选择密钥</label>
                <select value={selectedKeyId} onChange={(e) => setSelectedKeyId(e.target.value)}>
                  <option value="">-- 请选择密钥 --</option>
                  {keys.filter(k => k.status === 'generated').map(k => (
                    <option key={k.id} value={k.id}>{k.id.substring(0, 16)}... ({k.length} bits)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>窃听概率</label>
                <input 
                  type="number" 
                  value={eavesdropProb} 
                  onChange={(e) => setEavesdropProb(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="1"
                  step="0.1"
                />
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${eavesdropProb * 100}%`, background: 'linear-gradient(90deg, #10b981, #ef4444)' }}></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>发送方</label>
                <input type="text" value={sender} onChange={(e) => setSender(e.target.value)} />
              </div>
              <div className="form-group">
                <label>接收方</label>
                <input type="text" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleTransmitKey} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: '20px', height: '20px' }}></span> : '🚀 模拟传输'}
            </button>

            {transmitResult && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: transmitResult.success ? '#10b981' : '#ef4444' }}>
                  传输结果: {transmitResult.eavesdropped ? '⚠️ 检测到窃听！' : transmitResult.success ? '✅ 传输成功' : '❌ 传输失败'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>发送方</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{transmitResult.sender}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>接收方</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{transmitResult.receiver}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>错误率</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{(transmitResult.error_rate * 100).toFixed(2)}%</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>状态</div>
                    <div>{getStatusBadge(transmitResult.status)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'check' && (
          <div className="card">
            <h2>🔍 密钥安全检测</h2>
            <div className="form-group">
              <label>输入待检测的密钥 (十六进制)</label>
              <textarea 
                value={checkKeyInput}
                onChange={(e) => setCheckKeyInput(e.target.value)}
                rows="3"
                placeholder="请输入密钥..."
              />
            </div>
            <button className="btn btn-primary" onClick={handleCheckKey} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: '20px', height: '20px' }}></span> : '🔬 开始检测'}
            </button>

            {checkResults && (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#00d4ff' }}>检测结果</h3>
                  <div className="status-badge" style={{ fontSize: '1rem', padding: '0.5rem 1.5rem' }}>
                    总分: {checkResults.total_score}/100
                  </div>
                </div>
                {checkResults.checks.map((check, index) => (
                  <div key={index} className={`check-item ${check.passed ? 'passed' : 'failed'}`}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{check.type}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{check.details}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: check.passed ? '#10b981' : '#ef4444' }}>
                        {check.passed ? '✅ 通过' : '❌ 未通过'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{check.score}/25 分</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card">
            <h2>📜 密钥历史记录</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>密钥ID</th>
                    <th>长度</th>
                    <th>状态</th>
                    <th>错误率</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{key.id.substring(0, 20)}...</td>
                      <td>{key.length} bits</td>
                      <td>{getStatusBadge(key.status)}</td>
                      <td>{(key.error_rate * 100).toFixed(2)}%</td>
                      <td>{new Date(key.created_at).toLocaleString('zh-CN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {keys.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>暂无记录</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Dashboard({ stats, keys, chartData }) {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_keys}</div>
          <div className="stat-label">总密钥数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.successful_keys}</div>
          <div className="stat-label">成功密钥</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.compromised_keys}</div>
          <div className="stat-label">被窃听密钥</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.failed_keys}</div>
          <div className="stat-label">失败密钥</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#a855f7' }}>{stats.average_key_length}</div>
          <div className="stat-label">平均密钥长度 (bits)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h2>📊 密钥状态分布</h2>
          <div className="visualization-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.slice(1)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.slice(1).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>📈 密钥统计</h2>
          <div className="visualization-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>💡 BB84 量子密钥分发协议说明</h2>
        <div style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>BB84 协议</strong>是第一个量子密钥分发协议，由 Charles Bennett 和 Gilles Brassard 于1984年提出。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>🔹 协议步骤</h4>
              <ol style={{ paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
                <li>Alice 随机生成比特序列和基</li>
                <li>Alice 通过量子信道发送量子比特</li>
                <li>Bob 随机选择基进行测量</li>
                <li>双方通过公开信道比对基</li>
                <li>保留基相同的比特形成密钥</li>
              </ol>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>🔹 安全特性</h4>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
                <li>量子不可克隆定理保证安全</li>
                <li>窃听必然引入可检测的干扰</li>
                <li>一次一密实现完美保密</li>
                <li>基于物理原理的信息安全</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
