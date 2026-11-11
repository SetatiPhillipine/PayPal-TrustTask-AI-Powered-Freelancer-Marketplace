import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { api, money } from '../api.js';
import { useAuth } from '../auth.jsx';

const LABEL = { pending: 'Not started', in_progress: 'In progress', submitted: 'Submitted', approved: 'Approved' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { api(`/projects/${id}`).then(setP).catch((e) => setErr(e.message)); }, [id]);
  const run = (fn) => async () => { setErr(''); try { setP(await fn()); } catch (e) { setErr(e.message); } };

  if (err && !p) return <p className="error">{err}</p>;
  if (!p) return <p className="muted">Loading…</p>;

  const isClient = user.role === 'client';
  const isMyFreelance = p.freelancer && p.freelancer._id === user.id;
  const paid = p.payment?.status === 'paid';
  const patch = (m, status) => run(() => api(`/projects/${p._id}/milestones/${m._id}`, { method: 'PATCH', body: { status } }))();

  return (
    <>
      <div className="head">
        <div>
          <span className={`pill ${p.status}`}>{p.status}</span>
          <h1>{p.title}</h1>
          <p className="muted">Client: {p.client?.name} · Freelancer: {p.freelancer?.name || 'Not assigned yet'}</p>
        </div>
        <div className="big-total"><span className="muted">Project total</span><strong>{money(p.total)}</strong></div>
      </div>
      {err && <p className="error">{err}</p>}
      {note && <p className="ok">{note}</p>}

      <div className="two">
        <section className="card">
          <h2>Brief</h2>
          <p>{p.summary}</p>
          <h3>Deliverables</h3>
          <ul>{p.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </section>

        <section className="card">
          <h2>Payment</h2>
          {paid ? (
            <p className="ok">Paid {money(p.payment.amount)} through PayPal.</p>
          ) : isClient ? (
            import.meta.env.VITE_PAYPAL_CLIENT_ID ? (
              <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture' }}>
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect' }}
                  createOrder={async () => (await api('/payments/create-order', { method: 'POST', body: { projectId: p._id } })).id}
                  onApprove={async (data) => {
                    try {
                      setP(await api('/payments/capture-order', { method: 'POST', body: { projectId: p._id, orderId: data.orderID } }));
                      setNote('Payment verified and recorded.');
                    } catch (e) { setErr(e.message); }
                  }}
                  onError={() => setErr('PayPal checkout failed. Try again.')}
                />
              </PayPalScriptProvider>
            ) : <p className="error">Add VITE_PAYPAL_CLIENT_ID to client/.env to enable checkout.</p>
          ) : <p className="muted">Waiting for the client to pay.</p>}
          <p className="muted small">PayPal sandbox mode. No real money moves.</p>
        </section>
      </div>

      {user.role === 'freelancer' && p.status === 'open' && (
        <button className="btn" onClick={run(() => api(`/projects/${p._id}/accept`, { method: 'POST' }))}>Accept this project</button>
      )}

      <section className="card">
        <h2>Milestones</h2>
        <ol className="ms">
          {p.milestones.map((m) => (
            <li key={m._id} className={m.status}>
              <div>
                <strong>{m.title}</strong>
                <p className="muted">{m.description}</p>
                <span className="muted small">Due about {m.dueInDays} days after start</span>
              </div>
              <div className="ms-side">
                <strong>{money(m.amount)}</strong>
                <span className={`pill ${m.status}`}>{LABEL[m.status]}</span>
                {isMyFreelance && m.status === 'pending' && <button className="btn small" onClick={() => patch(m, 'in_progress')}>Start</button>}
                {isMyFreelance && m.status === 'in_progress' && <button className="btn small" onClick={() => patch(m, 'submitted')}>Submit work</button>}
                {isClient && m.status === 'submitted' && <button className="btn small" onClick={() => patch(m, 'approved')}>Approve</button>}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
