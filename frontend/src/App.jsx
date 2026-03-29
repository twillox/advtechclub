import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Events from "./pages/Events";
import Projects from "./pages/Projects";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Chat from "./pages/Chat";
import Polls from "./pages/Polls";
import Concerns from "./pages/Concerns";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Onboarding from "./components/Onboarding";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSidebar from "./components/AdminSidebar";

const AdminLayout = ({ children }) => (
  <div className="flex bg-surface min-h-screen">
    <AdminSidebar />
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const Wrap = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role === "admin") return <AdminLayout>{children}</AdminLayout>;
  return children;
};

function App() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  // Check if user needs onboarding (no username means incomplete profile)
  const needsOnboarding = token && role !== "admin" && !user.username;

  const renderRoot = () => {
    if (!token) return <Navigate to="/login" replace />;
    if (needsOnboarding) return <Onboarding />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={renderRoot()} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={needsOnboarding ? <Onboarding /> : <Navigate to="/dashboard" replace />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<Wrap><ProtectedRoute requiredRole="user"><Dashboard /></ProtectedRoute></Wrap>} />
        <Route path="/events" element={<Wrap><ProtectedRoute requiredRole="user"><Events /></ProtectedRoute></Wrap>} />
        <Route path="/projects" element={<Wrap><ProtectedRoute requiredRole="user"><Projects /></ProtectedRoute></Wrap>} />
        <Route path="/projects/:id" element={<Wrap><ProtectedRoute requiredRole="user"><ProjectWorkspace /></ProtectedRoute></Wrap>} />
        <Route path="/chat" element={<Wrap><ProtectedRoute requiredRole="user"><Chat /></ProtectedRoute></Wrap>} />
        <Route path="/polls" element={<Wrap><ProtectedRoute requiredRole="user"><Polls /></ProtectedRoute></Wrap>} />
        <Route path="/concerns" element={<Wrap><ProtectedRoute requiredRole="user"><Concerns /></ProtectedRoute></Wrap>} />
        <Route path="/resources" element={<Wrap><ProtectedRoute requiredRole="user"><Resources /></ProtectedRoute></Wrap>} />
        <Route path="/profile" element={<Wrap><ProtectedRoute requiredRole="user"><Profile /></ProtectedRoute></Wrap>} />
        <Route path="/user/:username" element={<Wrap><Profile /></Wrap>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout><ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute></AdminLayout>} />

        {/* Catch-all redirect */}
        <Route path="*" element={renderRoot()} />
      </Routes>
    </Router>
  );
}

export default App;
