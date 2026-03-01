import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusManagement from './pages/BusManagement';
import BrtManagement from './pages/BrtManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/bus" element={<BusManagement />} />
      <Route path="/admin/brt" element={<BrtManagement />} />
    </Routes>
  );
}

export default App;
