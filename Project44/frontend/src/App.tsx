import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataQuery from './pages/DataQuery';
import SystemStatus from './pages/SystemStatus';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="data" element={<DataQuery />} />
          <Route path="system" element={<SystemStatus />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
