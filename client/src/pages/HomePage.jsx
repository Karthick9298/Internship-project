import { Link } from "react-router-dom";
import { Upload, Hash, Download, Shield, Clock, TrendingDown, QrCode, ArrowRight } from "lucide-react";
import "./HomePage.css";

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="feature-card">
    <div className="feature-icon">
      <Icon size={22} />
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const StepBadge = ({ num, label }) => (
  <div className="step-item">
    <div className="step-num">{num}</div>
    <span>{label}</span>
  </div>
);

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content fade-in">
            <div className="badge badge-primary hero-badge">
              ✦ Secure · Temporary · Code-Based
            </div>
            <h1 className="hero-title">
              Share files with a<br />
              <span className="hero-gradient">6-character code</span>
            </h1>
            <p className="hero-desc">
              Upload any file, get a short code, share it with anyone.
              Files auto-expire. No signup required.
            </p>
            <div className="hero-actions">
              <Link to="/upload" className="btn btn-primary btn-lg">
                <Upload size={20} /> Upload a File
              </Link>
              <Link to="/share" className="btn btn-secondary btn-lg">
                <Hash size={20} /> Enter a Code
              </Link>
            </div>
          </div>

          {/* Mock share card */}
          <div className="hero-card fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="mock-card">
              <div className="mock-card-header">
                <div className="mock-dot red" />
                <div className="mock-dot yellow" />
                <div className="mock-dot green" />
                <span className="mock-title">codeshare.app</span>
              </div>
              <div className="mock-body">
                <div className="mock-file-icon">📄</div>
                <div className="mock-file-name">project-report.pdf</div>
                <div className="mock-file-size text-muted text-sm">2.4 MB · PDF</div>
                <div className="mock-code-box">
                  <span className="mock-code-label text-xs text-muted">Share Code</span>
                  <div className="mock-code">K7P2X9</div>
                </div>
                <div className="mock-meta">
                  <span className="badge badge-success">✓ Active</span>
                  <span className="text-xs text-muted">Expires in 24h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-header text-center">
            <h2>How it works</h2>
            <p className="text-secondary">Three simple steps to share any file</p>
          </div>
          <div className="steps-row">
            <StepBadge num="1" label="Upload your file" />
            <div className="step-arrow"><ArrowRight size={18} /></div>
            <StepBadge num="2" label="Get a 6-character code" />
            <div className="step-arrow"><ArrowRight size={18} /></div>
            <StepBadge num="3" label="Recipient enters code & downloads" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header text-center">
            <h2>Everything you need</h2>
            <p className="text-secondary">Built for simplicity, security, and control</p>
          </div>
          <div className="features-grid">
            <FeatureCard
              icon={Shield}
              title="Password Protection"
              desc="Optionally lock your files with a password. Only those with the code AND password can download."
            />
            <FeatureCard
              icon={Clock}
              title="Auto Expiry"
              desc="Set files to expire in 1h, 6h, 24h, or 7 days. Files are automatically removed after expiry."
            />
            <FeatureCard
              icon={TrendingDown}
              title="Download Limits"
              desc="Limit how many times a file can be downloaded. Perfect for controlled distribution."
            />
            <FeatureCard
              icon={QrCode}
              title="QR Code Sharing"
              desc="Every share link comes with a scannable QR code. Perfect for in-person sharing demos."
            />
            <FeatureCard
              icon={Upload}
              title="No Account Needed"
              desc="Guests can upload without signing up. Register to track your files, view analytics, and manage shares."
            />
            <FeatureCard
              icon={Download}
              title="Download Analytics"
              desc="See exactly how many times your file was downloaded. Registered users get a full dashboard."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to share?</h2>
            <p className="text-secondary">No account needed. Upload in seconds.</p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link to="/upload" className="btn btn-primary btn-lg">
                <Upload size={18} /> Get Started Free
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
