import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, register, loading } = useAuth();
  const nav = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', phone: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (isRegister) {
        await register({ username: form.username.trim(), email: form.email.trim(), password: form.password, fullName: form.fullName.trim(), phone: form.phone.trim() });
        await login(form.username.trim(), form.password);
      } else {
        await login(form.username.trim(), form.password);
      }
      setBusy(false);
      nav('/', { replace: true });
    } catch (err) {
      console.error('Login/Register error:', err);
      const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : '') || err.message || 'Could not sign in. Check your details and that the backend is running.';
      setError(msg);
      setBusy(false);
    }
  };
  return <div className="login-page"><div className="login-left"><div className="login-brand"><div className="brand-mark">B</div><b>BankEase</b></div><div className="login-copy"><span className="pill">NEXTGEN NET BANKING</span><h1>Banking made<br/><em>simple & secure.</em></h1><p>Manage your accounts and transfers from one secure place.</p><div className="trust-row"><span><ShieldCheck size={18}/> JWT protected banking</span><span><LockKeyhole size={17}/> Secure sign in</span></div></div></div><div className="login-right"><form className="login-card" onSubmit={submit}><div className="login-heading"><h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2><p>{isRegister ? 'Join BankEase to get started' : 'Sign in to your personal BankEase account'}</p></div>
    {isRegister && <><label>Full name<input value={form.fullName} onChange={change('fullName')} placeholder="Enter your full name" required/></label><label>Email address<input type="email" value={form.email} onChange={change('email')} placeholder="name@example.com" required/></label><label>Phone<input type="tel" value={form.phone} onChange={change('phone')} placeholder="10-digit mobile number" required/></label></>}
    <label>{isRegister ? 'Username' : 'Username or Email address'}<input autoComplete="username" value={form.username} onChange={change('username')} placeholder={isRegister ? 'Choose a unique username' : 'Enter your username or email'} required/></label><label>Password<div className="password"><input autoComplete={isRegister ? 'new-password' : 'current-password'} type={show?'text':'password'} value={form.password} onChange={change('password')} placeholder="Enter password" required minLength={isRegister ? 8 : undefined}/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
    {error && <p role="alert" className="form-error">{String(error)}</p>}<button className="primary-btn full" type="submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={18}/></button><p className="demo-note"><button type="button" className="text-link" onClick={()=>{setIsRegister(!isRegister);setError('')}}>{isRegister ? 'Already registered? Sign in' : 'New to BankEase? Create an account'}</button></p><div className="login-footer">Protected by BankEase Security <ShieldCheck size={15}/></div></form></div></div>;
}
