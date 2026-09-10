import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./AuthPages.css";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!/\S+@\S+\.\S+/.test(email)) e.email = "Valid email required.";
    if (password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created! Welcome to CodeShare.");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Registration failed.";
      setErrors({ server: msg });
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
              <UserPlus size={22} />
            </div>
            <h1>Create account</h1>
            <p className="text-secondary text-sm">Join CodeShare for file management & analytics</p>
          </div>

          {errors.server && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              {errors.server}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="pw-input-wrap">
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  className={`form-input ${errors.password ? "error" : ""}`}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="register-submit-btn">
              {loading ? <><span className="spinner" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <p className="auth-footer text-center text-sm text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-color font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
