// Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Style/Login.css';

// ─── SVG Icons ───────────────────────────────────────────────

const IconMail = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = ({ show }) =>
  show ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

// ─── Login Component ──────────────────────────────────────────

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      alert(`Welcome back ${user.displayName}!`);
      setFormData({ email: '', password: '' });
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        alert('Sign-in cancelled');
      } else {
        alert('Google sign-in failed: ' + err.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      alert('Login successful!');
      setFormData({ email: '', password: '' });
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setErrors({ email: 'Email not registered' });
      } else if (err.code === 'auth/wrong-password') {
        setErrors({ password: 'Incorrect password' });
      } else if (err.code === 'auth/invalid-email') {
        setErrors({ email: 'Invalid email format' });
      } else {
        alert(err.message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="reg-root">
      <div className="reg-card">

        {/* ── Header ── */}
        <h1 className="reg-title">Log In</h1>
        <p className="reg-subtitle">Welcome back</p>

        {/* ── Social sign-in row: Google | divider | Apple ── */}
        <div className="top-actions">
          <button
            type="button"
            className="google-oauth-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? <span className="google-loading" /> : <GoogleIcon />}
            {googleLoading ? 'Connecting...' : 'Sign in with Google'}
          </button>

          <div className="divider">or</div>

          <button type="button" className="apple-oauth-btn">
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        <div className="divider-full">or sign in with email</div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-body">

            {/* Email */}
            <div className="form-group full-width">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><IconMail /></span>
                <input
                  className={`form-input${errors.email ? ' error-input' : ''}`}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group full-width">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><IconLock /></span>
                <input
                  className={`form-input${errors.password ? ' error-input' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  <IconEye show={showPassword} />
                </button>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

            {/* Forgot Password */}
            <div className="forgot-row">
              <a href="#">Forgot password?</a>
            </div>

          </div>{/* end .form-body */}

          {/* ── Footer: submit ── */}
          <div className="form-footer">
            <button type="submit" className="submit-btn" disabled={loginLoading}>
              {loginLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>

        </form>

        <p className="login-row">
          Don't have an account? <a href="/register">Sign Up</a>
        </p>

      </div>
    </div>
  );
};

export default Login;