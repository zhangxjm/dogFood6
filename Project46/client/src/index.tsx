import { render } from 'solid-js/web';
import { Router, Routes, Route, useNavigate, A } from '@solidjs/router';
import { createEffect, onMount } from 'solid-js';
import './index.css';
import { authStore } from './store/authStore';
import { socketService } from './services/socket';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MeetingRoom from './pages/MeetingRoom';
import DocumentEditor from './pages/DocumentEditor';
import Layout from './components/Layout';

function App() {
  onMount(() => {
    authStore.checkAuth().then(() => {
      if (authStore.isAuthenticated()) {
        socketService.init();
      }
    });
  });

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<Dashboard />} />
          <Route path="room/:id" element={<MeetingRoom />} />
          <Route path="document/:id" element={<DocumentEditor />} />
        </Route>
        <Route path="*" element={<FallbackNavigate />} />
      </Routes>
    </Router>
  );
}

function FallbackNavigate() {
  const navigate = useNavigate();
  createEffect(() => {
    navigate('/login', { replace: true });
  });
  return null;
}

function ProtectedRoute(props: { children: any }) {
  const navigate = useNavigate();

  createEffect(() => {
    const isLoading = authStore.loading();
    const isAuth = authStore.isAuthenticated();
    if (!isLoading && !isAuth) {
      navigate('/login', { replace: true });
    }
  });

  if (authStore.loading()) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-size': '18px',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        color: '#94a3b8',
      }}>
        <div class="pulse">加载中...</div>
      </div>
    );
  }

  if (!authStore.isAuthenticated()) {
    return null;
  }

  return props.children;
}

render(() => <App />, document.getElementById('root')!);
