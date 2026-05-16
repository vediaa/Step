/* import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Dashboard from "./pages/Dashboard/Dashboard";
import Courses from "./pages/Courses/Courses";
import Exams from "./pages/Exams/Exams";
import Goals from "./pages/Goals/Goals";
import Questions from "./pages/Questions/Questions";
import Profile from "./pages/Profile/Profile";
import GecmisDenemeler from "./pages/GecmisDenemeler/GecmisDenemeler"; //bak buna
import History from "./pages/History/History";
import Analysis from "./pages/Analysis/Analysis";
import DersProgrami from "./pages/DersProgrami/DersProgrami";
import OgrenciSorular from "./pages/OgrenciSorular/OgrenciSorular";
import OgretmenPanel from "./pages/OgretmenPanel/OgretmenPanel";
import "./App.css";
import "./color/Colors.css";

function App() {
  // Basit bir auth check (gerçek uygulamada context/redux kullanılmalı)
  const isAuthenticated = true; // Şimdilik true, sonra login sistemi eklenebilir

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes 
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/send-password" element={<ForgotPassword />} />

         
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <Dashboard />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/courses"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <Courses />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/exams"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <Exams />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/goals"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <Goals />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/questions"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <Questions />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <Profile />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/history"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <History />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/analysis"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <Analysis />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/ders-programi"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <DersProgrami />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/ogrenci-sorular"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <OgrenciSorular />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/ogretmen-panel"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <OgretmenPanel />
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
export default App; */

/* import React from "react";
import { Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome/Welcome.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import "./color/Colors.css";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  );
};

export default App; */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Sidebar from "./components/Sidebar/Sidebar";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Dashboard from "./pages/Dashboard/Dashboard";
import Courses from "./pages/Courses/Courses";
import Exams from "./pages/Exams/Exams";
import Goals from "./pages/Goals/Goals";
import Questions from "./pages/Questions/Questions";
import Profile from "./pages/Profile/Profile";
import History from "./pages/History/History";
import Analysis from "./pages/Analysis/Analysis";
import DersProgrami from "./pages/DersProgrami/DersProgrami";
import OgrenciSorular from "./pages/OgrenciSorular/OgrenciSorular";
import OgretmenPanel from "./pages/OgretmenPanel/OgretmenPanel";
import GecmisDenemeler from "./pages/GecmisDenemeler/GecmisDenemeler";
import OgretmenDashboard from "./pages/OgretmenDashboard/OgretmenDashboard";

import "./App.css";
import "./color/Colors.css";

// ── Sayfa ile Sidebar'ı saran layout ──────────────────────────────────────
const Layout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">{children}</div>
  </div>
);

// ── Giriş yapmış kullanıcı gerektiren route ───────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="app-loading">Yükleniyor...</div>;
  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// ── Sadece öğrenci görebilir ──────────────────────────────────────────────
const StudentRoute = ({ children }) => {
  const { isAuthenticated, isStudent, loading } = useAuth();
  if (loading) return <div className="app-loading">Yükleniyor...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isStudent) return <Navigate to="/ogretmen-panel" replace />;
  return <Layout>{children}</Layout>;
};

// ── Sadece öğretmen görebilir ─────────────────────────────────────────────
const TeacherRoute = ({ children }) => {
  const { isAuthenticated, isTeacher, loading } = useAuth();
  if (loading) return <div className="app-loading">Yükleniyor...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isTeacher) return <Navigate to="/ogrenci-sorular" replace />;
  return <Layout>{children}</Layout>;
};

// ── Giriş yapmışsa login/register'a gitmesin ─────────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isTeacher, loading } = useAuth();
  if (loading) return <div className="app-loading">Yükleniyor...</div>;
  if (isAuthenticated) {
    return (
      <Navigate to={isTeacher ? "/ogretmen-panel" : "/dashboard"} replace />
    );
  }
  return children;
};

// ── Route Tanımları ───────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/send-password" element={<ForgotPassword />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Her giriş yapmış kullanıcı */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Sadece öğrenci */}
      <Route
        path="/dashboard"
        element={
          <StudentRoute>
            <Dashboard />
          </StudentRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <StudentRoute>
            <Courses />
          </StudentRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <StudentRoute>
            <Exams />
          </StudentRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <StudentRoute>
            <Goals />
          </StudentRoute>
        }
      />
      <Route
        path="/questions"
        element={
          <StudentRoute>
            <Questions />
          </StudentRoute>
        }
      />
      <Route
        path="/history"
        element={
          <StudentRoute>
            <History />
          </StudentRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <StudentRoute>
            <Analysis />
          </StudentRoute>
        }
      />
      <Route
        path="/ders-programi"
        element={
          <StudentRoute>
            <DersProgrami />
          </StudentRoute>
        }
      />
      <Route
        path="/ogrenci-sorular"
        element={
          <StudentRoute>
            <OgrenciSorular />
          </StudentRoute>
        }
      />

      {/* Sadece öğretmen */}
      <Route
        path="/ogretmen-panel"
        element={
          <TeacherRoute>
            <OgretmenPanel />
          </TeacherRoute>
        }
      />
      <Route
        path="/ogretmen-dashboard"
        element={
          <TeacherRoute>
            <OgretmenDashboard />
          </TeacherRoute>
        }
      />

      {/* Bilinmeyen route → ana sayfaya */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
