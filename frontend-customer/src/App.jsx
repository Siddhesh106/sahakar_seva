import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PersonaSwitcher from './components/PersonaSwitcher';
import AuthorityGuard from './components/AuthorityGuard';
import Navbar from './components/Navbar';
import WorkerNavbar from './components/WorkerNavbar';
import AdminNavbar from './components/AdminNavbar';

// Public & Error Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Customer Pages
import Home from './pages/Home';
import NewBooking from './pages/NewBooking';
import BookingDetail from './pages/BookingDetail';
import History from './pages/History';
import Profile from './pages/Profile';

// Worker Pages
import WorkerHome from './pages/worker/WorkerHome';
import WorkerEarnings from './pages/worker/WorkerEarnings';
import WorkerSocialSecurity from './pages/worker/WorkerSocialSecurity';
import WorkerRatings from './pages/worker/WorkerRatings';
import WorkerKyc from './pages/worker/WorkerKyc';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminProfitShare from './pages/admin/AdminProfitShare';

// Layout Wrappers
function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PersonaSwitcher />
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function WorkerLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PersonaSwitcher />
      <WorkerNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PersonaSwitcher />
      <AdminNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

/**
 * Root Index Dispatcher:
 * Automatically routes authenticated users to their authorized workspace.
 */
function RootDispatcher() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'worker') {
    return <Navigate to="/worker" replace />;
  }
  if (user.role === 'coop_admin') {
    return <Navigate to="/admin" replace />;
  }

  // Customers see the Marketplace Home
  return (
    <CustomerLayout>
      <Home />
    </CustomerLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root Dynamic Authority Dispatcher */}
          <Route path="/" element={<RootDispatcher />} />

          {/* 🧑 CUSTOMER WORKSPACE (Authority: customer, coop_admin) */}
          <Route
            path="/customer"
            element={
              <AuthorityGuard allowedRoles={['customer', 'coop_admin']}>
                <CustomerLayout>
                  <Home />
                </CustomerLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/book/:categoryName"
            element={
              <AuthorityGuard allowedRoles={['customer', 'coop_admin']}>
                <CustomerLayout>
                  <NewBooking />
                </CustomerLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <AuthorityGuard allowedRoles={['customer', 'coop_admin']}>
                <CustomerLayout>
                  <BookingDetail />
                </CustomerLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/history"
            element={
              <AuthorityGuard allowedRoles={['customer', 'coop_admin']}>
                <CustomerLayout>
                  <History />
                </CustomerLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthorityGuard allowedRoles={['customer', 'coop_admin']}>
                <CustomerLayout>
                  <Profile />
                </CustomerLayout>
              </AuthorityGuard>
            }
          />

          {/* 👷 WORKER MEMBER WORKSPACE (Authority: worker, coop_admin) */}
          <Route
            path="/worker"
            element={
              <AuthorityGuard allowedRoles={['worker', 'coop_admin']}>
                <WorkerLayout>
                  <WorkerHome />
                </WorkerLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/worker/earnings"
            element={
              <AuthorityGuard allowedRoles={['worker', 'coop_admin']}>
                <WorkerLayout>
                  <WorkerEarnings />
                </WorkerLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/worker/social-security"
            element={
              <AuthorityGuard allowedRoles={['worker', 'coop_admin']}>
                <WorkerLayout>
                  <WorkerSocialSecurity />
                </WorkerLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/worker/ratings"
            element={
              <AuthorityGuard allowedRoles={['worker', 'coop_admin']}>
                <WorkerLayout>
                  <WorkerRatings />
                </WorkerLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/worker/kyc"
            element={
              <AuthorityGuard allowedRoles={['worker', 'coop_admin']}>
                <WorkerLayout>
                  <WorkerKyc />
                </WorkerLayout>
              </AuthorityGuard>
            }
          />

          {/* 🏛️ COOPERATIVE ADMIN WORKSPACE (Authority: coop_admin) */}
          <Route
            path="/admin"
            element={
              <AuthorityGuard allowedRoles={['coop_admin']}>
                <AdminLayout>
                  <AdminOverview />
                </AdminLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <AuthorityGuard allowedRoles={['coop_admin']}>
                <AdminLayout>
                  <AdminVerifications />
                </AdminLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <AuthorityGuard allowedRoles={['coop_admin']}>
                <AdminLayout>
                  <AdminDisputes />
                </AdminLayout>
              </AuthorityGuard>
            }
          />
          <Route
            path="/admin/profit-share"
            element={
              <AuthorityGuard allowedRoles={['coop_admin']}>
                <AdminLayout>
                  <AdminProfitShare />
                </AdminLayout>
              </AuthorityGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
