import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function AuthPage({ mode }) {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'client' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/app" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      await (mode === 'login' ? login({ email: f.email, password: f.password }) : register(f));
      nav('/app');
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  return (
    <div className="authwrap">
      <form className="card auth" onSubmit={submit}>
        <div className="brand">TrustTask</div>
        <h2>{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
        {mode === 'register' && (
          <>
            <label>Name<input value={f.name} onChange={set('name')} required /></label>
            <div className="seg">
              <label className={f.role === 'client' ? 'on' : ''}><input type="radio" name="role" checked={f.role === 'client'} onChange={() => setF({ ...f, role: 'client' })} />I need work done</label>
              <label className={f.role === 'freelancer' ? 'on' : ''}><input type="radio" name="role" checked={f.role === 'freelancer'} onChange={() => setF({ ...f, role: 'freelancer' })} />I do the work</label>
            </div>
          </>
        )}
        <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Password<input type="password" value={f.password} onChange={set('password')} minLength={8} required /></label>
        {err && <p className="error">{err}</p>}
        <button className="btn" disabled={busy}>{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <p className="muted small">
          {mode === 'login' ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Sign in</Link></>}
        </p>
      </form>
    </div>
  );
}
