import React from "react";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { LandingPage } from "./pages/LandingPage";
import { StaffLogin } from "./pages/StaffLogin";
import { Dashboard } from "./pages/StudentDashboard";
import { RegisterDevice } from "./pages/RegisterDevice";
import { DeviceList } from "./pages/DeviceList";
import { ReportDevice } from "./pages/ReportDevice";
import { Profile } from "./pages/Profile";
import { OnboardingProvider } from "./context/OnboardingContext";
import StaffDashboard from "./pages/StaffDashboard";
import { AllDevices } from "./pages/AllDevices";
import { Reports } from "./pages/Report";
import { StudentManagement } from "./pages/StudentManagement";
import { VerifyDevices } from "./pages/VerifyDevices";
import { LostDevices } from "./pages/LostDevices";
import { StaffProfile } from "./pages/StaffProfile";
import { StaffSettings } from "./pages/StaffSettings";
import { SupabaseProvider } from "./context/SupabaseContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const App: React.FC = () => {
  return (
    <>
      <SupabaseProvider>
        <OnboardingProvider>
          <Routes>
            {/* Public routes */}

            <Route path="/" element={<LandingPage />} />
            <Route path="/student/login" element={<Login />} />
            <Route path="/student/register" element={<Register />} />
            <Route path="/staff/login" element={<StaffLogin />} />

            {/* Student protected routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute studentOnly>
                  {" "}
                  <Dashboard />{" "}
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard/register-device"
              element={
                <ProtectedRoute studentOnly>
                  <RegisterDevice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard/devices"
              element={
                <ProtectedRoute studentOnly>
                  {" "}
                  <DeviceList />{" "}
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard/report-lost"
              element={
                <ProtectedRoute studentOnly>
                  <ReportDevice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute studentOnly>
                  {" "}
                  <Profile />{" "}
                </ProtectedRoute>
              }
            />
            {/* Staff protected routes */}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute staffOnly>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/devices"
              element={
                <ProtectedRoute staffOnly>
                  <AllDevices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/verify"
              element={
                <ProtectedRoute staffOnly>
                  <VerifyDevices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/lost-devices"
              element={
                <ProtectedRoute staffOnly>
                  <LostDevices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/reports"
              element={
                <ProtectedRoute staffOnly>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/students"
              element={
                <ProtectedRoute staffOnly>
                  <StudentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/profile"
              element={
                <ProtectedRoute staffOnly>
                  <StaffProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/settings"
              element={
                <ProtectedRoute staffOnly>
                  <StaffSettings />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </OnboardingProvider>
      </SupabaseProvider>
    </>
  );
};

export default App;
