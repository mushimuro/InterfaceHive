import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import VerifyEmailSent from './pages/VerifyEmailSent';

// Project Pages
import Home from './pages/Home';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import MyProjects from './pages/MyProjects';
import MyContributions from './pages/MyContributions';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import AdminPanel from './pages/AdminPanel';

// Placeholder pages
const Dashboard = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Your personalized dashboard (coming soon)</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/verify-email-sent" element={<VerifyEmailSent />} />

            {/* Project Routes (Public browsing, auth required for create/edit) */}
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            
            {/* Public User Profiles */}
            <Route path="/users/:userId" element={<PublicProfile />} />
            
            {/* Protected Project Routes */}
            <Route element={<ProtectedRoute requireVerified />}>
              <Route path="/projects/create" element={<CreateProject />} />
              <Route path="/projects/:id/edit" element={<EditProject />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/my-contributions" element={<MyContributions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
