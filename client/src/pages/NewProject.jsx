import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';

export default function NewProject() {
  const nav = useNavigate();
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI assistant. What kind of project are you looking to get done today? (e.g., 'I need a 5-page website for my bakery with an online order form')" }
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Brief state
  const [brief, setBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [err, setErr] = useState('');

  // Handle sending a chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setChatLoading(true);
    setErr('');

    try {
      const res = await api('/ai/chat', { method: 'POST', body: { messages: newMessages } });
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (error) {
      setErr(error.message);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle generating the final brief from the chat history
  async function generateBrief() {
    setErr(''); 
    setBriefLoading(true);
    try {
      // We send the whole conversation to the brief generator
      const res = await api('/ai/brief', { method: 'POST', body: { messages } });
      setBrief(res);
    } catch (e) { 
      setErr(e.message); 
    }
    setBriefLoading(false);
  }

  // Handle editing the brief
  const setMs = (i, k, v) => setBrief({ ...brief, milestones: brief.milestones.map((m, j) => (j === i ? { ...m, [k]: v } : m)) });
  const sum = brief?.milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0) || 0;

  // Handle saving the project to the database
  async function save() {
    setErr(''); 
    setBriefLoading(true);
    try {
      const p = await api('/projects', { method: 'POST', body: { ...brief, description: messages.map(m => m.content).join('\n') } });
      nav(`/app/projects/${p._id}`);
    } catch (e) { 
      setErr(e.message); 
      setBriefLoading(false); 
    }
  }

  return (
    <>
      <div className="head"><h1>New project</h1></div>
      
      {!brief ? (
        // CHAT INTERFACE
        <div className="card form">
          <div className="chat-window" style={{ height: '400px', overflowY: 'auto', marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '1rem' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '12px', 
                  background: msg.role === 'user' ? '#2563eb' : '#e5e7eb', 
                  color: msg.role === 'user' ? 'white' : 'black',
                  maxWidth: '80%'
                }}>
                  {msg.content}
                </span>
              </div>
            ))}
            {chatLoading && <div style={{ color: '#666', fontStyle: 'italic' }}>AI is typing...</div>}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer here..."
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
              disabled={chatLoading}
            />
            <button type="submit" className="btn" disabled={chatLoading || !input.trim()}>
              Send
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Happy with the details?</p>
            <button className="btn" onClick={generateBrief} disabled={chatLoading || briefLoading || messages.length < 3}>
              {briefLoading ? 'Generating Brief...' : 'Generate Final Brief'}
            </button>
          </div>
        </div>
      ) : (
        // BRIEF REVIEW INTERFACE
        <div className="card form">
          <h2>Review your brief</h2>
          <label>Title<input value={brief.title} onChange={(e) => setBrief({ ...brief, title: e.target.value })} /></label>
          <label>Summary<textarea rows={3} value={brief.summary} onChange={(e) => setBrief({ ...brief, summary: e.target.value })} /></label>
          
          <div>
            <strong>Deliverables</strong>
            <ul>{brief.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </div>
          
          <strong>Milestones</strong>
          {brief.milestones.map((m, i) => (
            <div className="ms-edit" key={i}>
              <input value={m.title} onChange={(e) => setMs(i, 'title', e.target.value)} />
              <input value={m.description} onChange={(e) => setMs(i, 'description', e.target.value)} />
              <input type="number" min="0" value={m.amount} onChange={(e) => setMs(i, 'amount', e.target.value)} />
            </div>
          ))}
          
          <p className="row between"><span className="muted">Total</span><strong>{money(sum)}</strong></p>
          
          <button className="btn" onClick={save} disabled={briefLoading}>
            {briefLoading ? 'Posting...' : 'Post project'}
          </button>
          <button className="btn" style={{ background: '#ccc', color: '#000', marginTop: '0.5rem' }} onClick={() => setBrief(null)} disabled={briefLoading}>
            Back to Chat
          </button>
        </div>
      )}
      
      {err && <p className="error" style={{ color: 'red', marginTop: '1rem' }}>{err}</p>}
    </>
  );
}