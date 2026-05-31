import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Defects from '@/pages/Defects';
import Sorting from '@/pages/Sorting';
import Reports from '@/pages/Reports';
import Devices from '@/pages/Devices';
import System from '@/pages/System';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/defects" element={<Defects />} />
          <Route path="/sorting" element={<Sorting />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/system" element={<System />} />
        </Route>
      </Routes>
    </Router>
  );
}
