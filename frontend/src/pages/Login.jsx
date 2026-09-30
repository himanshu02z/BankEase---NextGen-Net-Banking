import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowRight, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

const emptyRegister = { username: '', email: '', password: '', fullName: '', phone: '' };

export default function Login() {
  const { isAuthenticated, login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(emptyRegister);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submitLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      nav('/');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setInfo('Registration successful. Please sign in.');
      setUsername(form.username);
      setPassword('');
      setForm(emptyRegister);
      setMode('login');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setInfo('');
  };

  const field = (name, label, type = 'text') => (
    <label>
      {label}
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        required
      />
    </label>
  );

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand"><div className="brand-mark">B</div><b>BankEase</b></div>
        <div className="login-copy">
          <span className="pill">NEXTGEN NET BANKING</span>
          <h1>Banking made<br /><em>simple & secure.</em></h1>
          <p>Manage your money, transfer funds and track every transaction from one secure place.</p>
          <div className="trust-row">
            <span><ShieldCheck size={18} /> JWT secured</span>
            <span><LockKeyhole size={17} /> BCrypt passwords</span>
          </div>
        </div>
      </div>
      <div className="login-right">
        {mode === 'login' ? (
          <form className="login-card" onSubmit={submitLogin}>
            <div className="login-heading">
              <div className="mobile-brand"><div className="brand-mark">B</div></div>
              <h2>Welcome back</h2>
              <p>Sign in to your BankEase account</p>
            </div>
            {info && <div className="alert success-alert">{info}</div>}
            {error && <div className="alert error-alert">{error}</div>}
            <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
            <label>
              Password
              <div className="password">
                <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </label>
            <button className="primary-btn full" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : <>Sign in <ArrowRight size={18} /></>}
            </button>
            <p className="demo-note">
              New to BankEase? <button type="button" className="text-link" onClick={() => switchMode('register')}>Create an account</button>
            </p>
            <div className="login-footer">Protected by BankEase Security <ShieldCheck size={15} /></div>
          </form>
        ) : (
          <form className="login-card" onSubmit={submitRegister}>
            <div className="login-heading">
              <h2>Create account</h2>
              <p>Register for BankEase net banking</p>
            </div>
            {error && <div className="alert error-alert">{error}</div>}
            {field('fullName', 'Full name')}
            {field('username', 'Username')}
            {field('email', 'Email address', 'email')}
            {field('phone', 'Phone')}
            {field('password', 'Password', 'password')}
            <button className="primary-btn full" type="submit" disabled={loading}>
              {loading ? 'Registering…' : <>Register <ArrowRight size={18} /></>}
            </button>
            <p className="demo-note">
              Already registered? <button type="button" className="text-link" onClick={() => switchMode('login')}>Sign in</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
