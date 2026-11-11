import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewProject from './pages/NewProject.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';

function Shell({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">TrustTask</div>
        <nav>
          <NavLink to="/app" end>{user.role === 'client' ? 'My projects' : 'Find work'}</NavLink>
          {user.role === 'client' && <NavLink to="/app/new">New project</NavLink>}
        </nav>
        <div className="me">
          <strong>{user.name}</strong>
          <span>{user.role === 'client' ? 'Client' : 'Freelancer'}</span>
          <button className="link" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

function Private({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="muted pad">Loading…</p>;
  return user ? <Shell>{children}</Shell> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/app" element={<Private><Dashboard /></Private>} />
      <Route path="/app/new" element={<Private><NewProject /></Private>} />
      <Route path="/app/projects/:id" element={<Private><ProjectDetail /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
