import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import './Style/ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail()) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
      setEmail('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-root">
      <div className="reg-card">
        <div className="forgot-header">
          <button 
            type="button" 
            className="back-btn"
            onClick={() => navigate('/login')}
          >
            ← Back to Login
          </button>
        </div>

        <h1 className="reg-title">Reset Password</h1>
        <p className="reg-subtitle">Enter your email to receive a password reset link</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-body forgot-body">
            <div className="form-group full-width">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <input
                  className={`form-input${error && email ? ' error-input' : ''}`}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="your.email@example.com"
                />
              </div>
              {error && <span className="error-msg">{error}</span>}
              {success && <span className="success-msg">{success}</span>}
            </div>
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <p className="login-row">
          Remember your password? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
