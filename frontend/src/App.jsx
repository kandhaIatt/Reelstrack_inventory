import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SheetModal from './components/SheetModal';
import ToastHost from './components/ToastHost';
import OfflineBanner from './components/OfflineBanner';

import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/DashboardScreen';
import ReelsScreen from './pages/ReelsScreen';
import ReelDetailScreen from './pages/ReelDetailScreen';
import NewJobScreen from './pages/NewJobScreen';
import AddReelScreen from './pages/AddReelScreen';
import BulkAddReelsScreen from './pages/BulkAddReelsScreen';
import JobsScreen from './pages/JobsScreen';
import PurchaseOrdersScreen from './pages/PurchaseOrdersScreen';
import PODetailScreen from './pages/PODetailScreen';
import CreatePOScreen from './pages/CreatePOScreen';
import ReceiveReelsScreen from './pages/ReceiveReelsScreen';
import TransferScreen from './pages/TransferScreen';
import TransferHistoryScreen from './pages/TransferHistoryScreen';
import UnitsScreen from './pages/UnitsScreen';
import UnitDetailScreen from './pages/UnitDetailScreen';
import ReportsScreen from './pages/ReportsScreen';
import POReportsScreen from './pages/POReportsScreen';
import StockCountsScreen from './pages/StockCountsScreen';
import ImportReelsScreen from './pages/ImportReelsScreen';

import ChangePasswordScreen from './pages/ChangePasswordScreen';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';

import {
  SuppliersScreen,
  MillsScreen,
  ReelTypesScreen,
  SettingsScreen,
  UnitsMasterScreen
} from './pages/MastersScreens';

import UsersScreen from './pages/UsersScreen';
import AuditLogScreen from './pages/AuditLogScreen';

import ProtectedRoute from './components/ProtectedRoute';


function AuthenticatedLayout() {
  const { user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force user to change password
  if (user.forcePasswordChange) {
    return (
      <Routes>
        <Route
          path="/change-password"
          element={<ChangePasswordScreen />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/change-password"
              replace
            />
          }
        />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <OfflineBanner />
      <div className="app" style={{ flex: 1, minHeight: 0 }}>
        <Sidebar
          isOpen={navOpen}
          onClose={() => setNavOpen(false)}
        />

      <div className="main">
        <Topbar
          onToggleMenu={() => setNavOpen(true)}
        />

        <main className="screen">
          <Routes>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<DashboardScreen />}
            />

            {/* Reels - Everyone can view */}
            <Route
              path="/reels"
              element={<ReelsScreen />}
            />

            <Route
              path="/reels/:id"
              element={<ReelDetailScreen />}
            />

            {/* Jobs - User and Admin can create */}
            <Route
              path="/jobs"
              element={<JobsScreen />}
            />

            <Route
              path="/jobs/new"
              element={<NewJobScreen />}
            />

            {/* Purchase Orders - Everyone can view */}
            <Route
              path="/pos"
              element={<PurchaseOrdersScreen />}
            />

            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

            <Route
              path="/pos/:id"
              element={<PODetailScreen />}
            />

            {/* Create PO - Admin only */}
            <Route
              path="/pos/create"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CreatePOScreen />
                </ProtectedRoute>
              }
            />

            {/* Receive Reels - Admin only */}
            <Route
              path="/pos/:id/receive"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ReceiveReelsScreen />
                </ProtectedRoute>
              }
            />

            {/* Transfers - Everyone can view */}
            <Route
              path="/transfers"
              element={<TransferHistoryScreen />}
            />

            {/* Create Transfer - Admin only */}
            <Route
              path="/transfers/new"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <TransferScreen />
                </ProtectedRoute>
              }
            />

            {/* Stock Counts - Everyone can view/initiate */}
            <Route
              path="/stock-counts"
              element={<StockCountsScreen />}
            />

            {/* Import Reels - Admin only */}
            <Route
              path="/reels/import"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ImportReelsScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reels/add"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AddReelScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reels/bulk-add"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <BulkAddReelsScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/units"
              element={<UnitsScreen />}
            />

            <Route
              path="/units/manage"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <UnitsMasterScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/units/:id"
              element={<UnitDetailScreen />}
            />

            {/* Reports - Everyone can view */}
            <Route
              path="/reports"
              element={<ReportsScreen />}
            />

            <Route
              path="/po-reports"
              element={<POReportsScreen />}
            />

            {/* Suppliers - Everyone can read */}
            <Route
              path="/suppliers"
              element={<SuppliersScreen />}
            />

            {/* Mills - Everyone can read */}
            <Route
              path="/mills"
              element={<MillsScreen />}
            />

            {/* Reel Types - Everyone can read */}
            <Route
              path="/reel-types"
              element={<ReelTypesScreen />}
            />

            {/* User Management - Admin only */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <UsersScreen />
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={<SettingsScreen />}
            />
            <Route
             path="/change-password"
             element={<ChangePasswordScreen />}
            />

            {/* Invalid URL */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>
        </main>
      </div>

      <SheetModal />
      <ToastHost />
      </div>
    </div>
  );
}





export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginScreenWrapper />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />}/>
            <Route path="/*" element={<AuthenticatedLayout />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

function LoginScreenWrapper() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginScreen />;
}
