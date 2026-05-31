import { Router, Route, A } from '@solidjs/router'
import { lazy, Suspense } from 'solid-js'

const Dashboard = lazy(() => import('./views/Dashboard.jsx'))
const CommandCenter = lazy(() => import('./views/CommandCenter.jsx'))
const PayloadMonitor = lazy(() => import('./views/PayloadMonitor.jsx'))
const AlertCenter = lazy(() => import('./views/AlertCenter.jsx'))
const DeviceManagement = lazy(() => import('./views/DeviceManagement.jsx'))

function Layout(props) {
  const menuItems = [
    { path: '/', name: '系统总览', icon: '📊' },
    { path: '/command', name: '指令中心', icon: '🎯' },
    { path: '/payload', name: '载荷监控', icon: '📡' },
    { path: '/alert', name: '告警中心', icon: '⚠️' },
    { path: '/device', name: '设备管理', icon: '🔧' }
  ]

  return (
    <div class="app-container">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <h2>🚀 测控调度系统</h2>
          <p>航天发射场指挥平台</p>
        </div>
        <ul class="sidebar-menu">
          {menuItems.map(item => (
            <li>
              <A href={item.path} activeClass="active">
                <span style={{ marginRight: '8px' }}>{item.icon}</span>
                {item.name}
              </A>
            </li>
          ))}
        </ul>
      </aside>
      <main class="main-content">
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#7a8aa8' }}>加载中...</div>}>
          {props.children}
        </Suspense>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/command" element={<CommandCenter />} />
      <Route path="/payload" element={<PayloadMonitor />} />
      <Route path="/alert" element={<AlertCenter />} />
      <Route path="/device" element={<DeviceManagement />} />
    </Router>
  )
}
