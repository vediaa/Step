import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Courses from "./pages/Courses/Courses";
import Exams from "./pages/Exams/Exams";
import Goals from "./pages/Goals/Goals";
import Questions from "./pages/Questions/Questions";
import Profile from "./pages/Profile/Profile";
import GecmisDenemeler from "./pages/GecmisDenemeler/GecmisDenemeler"; //bak buna
import DersProgrami from "./pages/DersProgrami/DersProgrami";
import "./App.css";
import "./color/Colors.css";

function App() {
  // Basit bir auth check (gerçek uygulamada context/redux kullanılmalı)
  const isAuthenticated = true; // Şimdilik true, sonra login sistemi eklenebilir

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with sidebar */}
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
            path="/gecmis-denemeler"
            element={
              isAuthenticated ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    <GecmisDenemeler />
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
        </Routes>
      </div>
    </Router>
  );
}
export default App;

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
