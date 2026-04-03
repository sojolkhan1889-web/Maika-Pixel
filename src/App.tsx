import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Settings } from './pages/Settings';
import { Customers } from './pages/Customers';
import { Pixels } from './pages/Pixels';
import { EventLogs } from './pages/EventLogs';
import { IncompleteOrders } from './pages/IncompleteOrders';
import { ExportData } from './pages/ExportData';
import { UserAccount } from './pages/UserAccount';
import { Subscription } from './pages/Subscription';
import { Analytics } from './pages/Analytics';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSellers } from './pages/admin/AdminSellers';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminBilling } from './pages/admin/AdminBilling';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
          <Route path="customers" element={<Customers />} />
          <Route path="pixels" element={<Pixels />} />
          <Route path="event-logs" element={<EventLogs />} />
          <Route path="incomplete-orders" element={<IncompleteOrders />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="export" element={<ExportData />} />
          <Route path="account" element={<UserAccount />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="billing" element={<AdminBilling />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
