import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Materials from "@/pages/Materials";
import Checkin from "@/pages/Checkin";
import Progress from "@/pages/Progress";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
      </Routes>
    </Router>
  );
}
