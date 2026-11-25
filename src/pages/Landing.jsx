import { Link } from "react-router-dom";
import { Button } from "../components/ui/Form.jsx";

export default function Landing() {
  return (
    <div className="land">
      <header>
        <Link to="/" className="brand">
          <span className="mark" /> Pitching Evaluator
        </Link>
        <div className="nav">
          <Link to="/director/login">Sign in</Link>
          <Link to="/director/signup">
            <Button>Create Director account</Button>
          </Link>
        </div>
      </header>
      <main>
        <p className="kicker">Competition management</p>
        <h1>Professional evaluation for pitches, prizes, and juried events.</h1>
        <p className="lede">
          Directors run the programme. Judges score through a unique secure link — no accounts,
          no passwords, no friction.
        </p>
        <div className="cta">
          <Link to="/director/signup">
            <Button size="lg">Get started</Button>
          </Link>
          <Link to="/director/login">
            <Button size="lg" variant="secondary">
              Sign in
            </Button>
          </Link>
        </div>
        <div className="features">
          <article>
            <h3>Secure judge links</h3>
            <p>Each evaluator receives a cryptographically unique link. Revoke or rotate at any time.</p>
          </article>
          <article>
            <h3>Custom scoring</h3>
            <p>Define criteria, allowed scores, and weights per event. Defaults for startup pitches included.</p>
          </article>
          <article>
            <h3>Live rankings</h3>
            <p>Averages, progress, feedback, and CSV export — ready when evaluations close.</p>
          </article>
        </div>
      </main>
      <style>{`
        .land { min-height: 100vh; background: #fff; }
        header {
          max-width: 1120px; margin: 0 auto; padding: 20px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; color: var(--navy); }
        .mark { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, var(--navy), var(--gold)); }
        .nav { display: flex; align-items: center; gap: 16px; }
        main { max-width: 880px; margin: 0 auto; padding: 72px 24px 96px; }
        .kicker { color: var(--gold); letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; font-weight: 700; }
        h1 { font-family: var(--serif); font-size: clamp(2.1rem, 5vw, 3.4rem); line-height: 1.15; margin: 12px 0 16px; }
        .lede { font-size: 1.15rem; color: var(--muted); max-width: 640px; }
        .cta { display: flex; gap: 12px; margin: 32px 0 56px; flex-wrap: wrap; }
        .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .features article {
          border: 1px solid var(--line); border-radius: 12px; padding: 20px; background: var(--bg);
        }
        .features h3 { font-size: 16px; margin-bottom: 8px; }
        .features p { color: var(--muted); font-size: 14px; }
        @media (max-width: 760px) {
          .features { grid-template-columns: 1fr; }
          .nav a:first-child { display: none; }
        }
      `}</style>
    </div>
  );
}
