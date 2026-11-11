import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing-wrapper" key="landing">
      <div className="landing-content">
        <header className="top">
          <div className="brand">TrustTask</div>
          <div className="row">
            <Link className="btn ghost" to="/login">Sign in</Link>
            <Link className="btn" to="/register">Get started</Link>
          </div>
        </header>
        <section className="hero">
          <h1>Clear projects.<br />Trusted partnerships.</h1>
          <p>Describe the work you need. TrustTask turns it into a brief with milestones and deliverables, so you and your freelancer agree before the work starts and pay as it progresses.</p>
          <div className="row">
            <Link className="btn big" to="/register">Plan a project</Link>
            <Link className="btn ghost big" to="/register">Find work</Link>
          </div>
        </section>
        <section className="how">
          <div><h3>Write what you need</h3><p>Plain language is enough. Add a budget if you have one.</p></div>
          <div><h3>Review the brief</h3><p>AI drafts the scope, deliverables and milestone prices. You edit anything.</p></div>
          <div><h3>Approve and pay</h3><p>Approve each milestone as it is delivered. Pay through PayPal.</p></div>
        </section>
      </div>
    </div>
  );
}