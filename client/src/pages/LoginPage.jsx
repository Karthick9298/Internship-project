import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./AuthPages.css";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper auth-page">
      <div className="container" style={{ maxWidth: 440 }}>
        <div className="card fade-in">
          <div className="auth-header">
            <div className="auth-icon">
              <LogIn size={22} />
            </div>
            <h1>Welcome back</h1>
            <p className="text-secondary text-sm">Sign in to your CodeShare account</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="pw-input-wrap">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="login-submit-btn">
              {loading ? <><span className="spinner" /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <p className="auth-footer text-center text-sm text-secondary">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary-color font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
