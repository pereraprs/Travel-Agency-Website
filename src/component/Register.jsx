import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from '../firebase';
import { countries } from 'countries-list';
import './Style/Register.css';

// ─── SVG Icons ───────────────────────────────────────────────

const IconUser = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconMail = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

const IconPhone = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02L6.6 10.8z" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconGlobe = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconPassport = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <circle cx="12" cy="11" r="3" />
    <path d="M8 19h8" />
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

// ─── Register Component ───────────────────────────────────────

const Register = () => {
  const navigate = useNavigate();
  const countryOptions = [
    { value: '', label: 'Select a country' },
    ...Object.entries(countries)
      .map(([code, country]) => ({ value: code, label: country.name }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Extract name from Google profile
      const [firstName, ...lastNameParts] = (user.displayName || '').split(' ');
      const lastName = lastNameParts.join(' ');

      // Auto-fill form with Google data
      setFormData((prev) => ({
        ...prev,
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email || '',
      }));

      // Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName || '',
        lastName: lastName || '',
        email: user.email || '',
        country: '',
        createdAt: new Date(),
        googleAuth: true,
      }, { merge: true });

      alert(`Welcome ${user.displayName}! Please complete the remaining fields and submit.`);
    } catch (err) {
      console.error('Google Sign-up Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        alert('Sign-up cancelled');
      } else {
        alert('Google sign-up failed: ' + err.message);
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
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (!agreed) newErrors.terms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;
  try {
    //formData.password (lowercase p)
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password  // was formData.Password
    );
    const user = userCredential.user;  // was userCredintial (typo)

    //  
    await setDoc(doc(db, "users", user.uid), {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      country: formData.country,
      createdAt: new Date(),  // was new Data()
    });

    alert('Registration Successful!');

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      country: '',
      password: '',
    });
    setAgreed(false);
    navigate('/login');
  } catch (err) {
    console.error(err);

    if (err.code === 'auth/email-already-in-use') {
      alert("Email already registered");
    } else if (err.code === 'auth/weak-password') {
      alert('Password should be at least 6 characters');
    } else {
      alert(err.message);
    }
  }
};
  
  return (
    <div className="reg-root">
      <div className="reg-card">

        {/* ── Header ── */}
        <h1 className="reg-title">Create Account</h1>
        <p className="reg-subtitle">Sign up to get started</p>

        {/* ── Social sign-in row: Google | divider | Apple ── */}
        <div className="top-actions">
          <button
            type="button"
            className="google-oauth-btn"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
          >
            {googleLoading ? <span className="google-loading" /> : <GoogleIcon />}
            {googleLoading ? 'Connecting...' : 'Sign up with Google'}
          </button>

          <div className="divider">or</div>

          <button type="button" className="apple-oauth-btn">
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        <div className="divider-full">or sign up with email</div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-body">

            {/* Col 1: First Name | Col 2: Last Name */}
            <div className="form-group">
              <label className="form-label">First Name</label>
              <div className="input-wrap">
                <span className="input-icon"><IconUser /></span>
                <input
                  className={`form-input${errors.firstName ? ' error-input' : ''}`}
                  name="firstName" value={formData.firstName}
                  onChange={handleChange} placeholder="First name"
                />
              </div>
              {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <div className="input-wrap">
                <span className="input-icon"><IconUser /></span>
                <input
                  className={`form-input${errors.lastName ? ' error-input' : ''}`}
                  name="lastName" value={formData.lastName}
                  onChange={handleChange} placeholder="Last name"
                />
              </div>
              {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
            </div>

            {/* Full width: Email */}
            <div className="form-group full-width">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><IconMail /></span>
                <input
                  className={`form-input${errors.email ? ' error-input' : ''}`}
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="your.email@example.com"
                />
              </div>
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

          

            {/* Col 1: Country | Col 2: Passport No */}
            <div className="form-group">
              <label className="form-label">Country</label>
              <div className="input-wrap">
                <span className="input-icon"><IconGlobe /></span>
                <select
                  className={`form-input${errors.country ? ' error-input' : ''}`}
                  name="country" value={formData.country} onChange={handleChange}
                >
                  {countryOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {errors.country && <span className="error-msg">{errors.country}</span>}
            </div>

           

            {/* Full width: Password */}
            <div className="form-group full-width">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><IconLock /></span>
                <input
                  className={`form-input${errors.password ? ' error-input' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="Create a strong password"
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword((p) => !p)}>
                  <IconEye show={showPassword} />
                </button>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

          </div>{/* end .form-body */}

          {/* ── Footer: terms + submit ── */}
          <div className="form-footer">
            <div className="terms-row">
              <input
                type="checkbox" id="terms"
                checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && (
              <p className="error-msg" style={{ marginTop: '-12px', marginBottom: '14px' }}>
                {errors.terms}
              </p>
            )}
            <button type="submit" className="submit-btn">Sign Up</button>
          </div>

        </form>

        <p className="login-row">
          Already have an account? <a href="/login">Log In</a>
        </p>

      </div>
    </div>
  );
};

export default Register;