import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusManagement from './pages/BusManagement';
import BrtManagement from './pages/BrtManagement';
import TerManagement from './pages/TerManagement';
import CatalogManagement from './pages/CatalogManagement';
import RulesManagement from './pages/RulesManagement';
import UserManagement from './pages/UserManagement';
import BillingManagement from './pages/BillingManagement';
import TripManagement from './pages/TripManagement';
import NotificationManagement from './pages/NotificationManagement';
import TestQRGenerator from './pages/TestQRGenerator';
import Monitoring from './pages/Monitoring';

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
            <RulesManagement />
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
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <BillingManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trips"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <TripManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <NotificationManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/test-qr"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <TestQRGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/monitoring"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <Monitoring />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
