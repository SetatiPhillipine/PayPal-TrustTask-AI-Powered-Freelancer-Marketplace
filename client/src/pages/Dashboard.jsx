import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../auth.jsx';

const total = (p) => p.milestones.reduce((s, m) => s + m.amount, 0);
const progress = (p) => (p.milestones.length ? Math.round((p.milestones.filter((m) => m.status === 'approved').length / p.milestones.length) * 100) : 0);

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/projects').then(setProjects).catch((e) => setErr(e.message)); }, []);

  if (err) return <p className="error">{err}</p>;
  if (!projects) return <p className="muted">Loading…</p>;

  const active = projects.filter((p) => p.status === 'active').length;
  const paid = projects.filter((p) => p.payment?.status === 'paid').reduce((s, p) => s + total(p), 0);

  return (
    <>
      <div className="head">
        <h1>{user.role === 'client' ? 'My projects' : 'Find work'}</h1>
        {user.role === 'client' && <Link className="btn" to="/app/new">New project</Link>}
      </div>
      <div className="stats">
        <div className="card"><span className="muted">{user.role === 'client' ? 'Projects' : 'Available or yours'}</span><strong>{projects.length}</strong></div>
        <div className="card"><span className="muted">In progress</span><strong>{active}</strong></div>
        <div className="card"><span className="muted">Paid through PayPal</span><strong>{money(paid)}</strong></div>
      </div>
      {projects.length === 0 ? (
        <div className="card empty">
          <h3>{user.role === 'client' ? 'No projects yet' : 'No open projects right now'}</h3>
          <p className="muted">{user.role === 'client' ? 'Describe what you need and TrustTask will draft the brief.' : 'Check back soon. New client projects appear here.'}</p>
          {user.role === 'client' && <Link className="btn" to="/app/new">Plan your first project</Link>}
        </div>
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <Link key={p._id} to={`/app/projects/${p._id}`} className="card proj">
              <div className="row between"><span className={`pill ${p.status}`}>{p.status}</span><strong>{money(total(p))}</strong></div>
              <h3>{p.title}</h3>
              <p className="muted clamp">{p.summary}</p>
              <div className="bar"><i style={{ width: `${progress(p)}%` }} /></div>
              <span className="muted small">{progress(p)}% approved · {p.client?.name}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
