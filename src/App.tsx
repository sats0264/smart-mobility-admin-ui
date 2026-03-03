import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusManagement from './pages/BusManagement';
import BrtManagement from './pages/BrtManagement';
import TerManagement from './pages/TerManagement';
import DiscountManagement from './pages/DiscountManagement';
import CatalogManagement from './pages/CatalogManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bus"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <BusManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/brt"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <BrtManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ter"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <TerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/discounts"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <DiscountManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/catalog"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <CatalogManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
