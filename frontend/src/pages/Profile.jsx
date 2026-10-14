import { Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading } = useAuth();
  if (loading) return null;
  const name = user?.fullName || user?.username || 'Customer';
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <div><div className="page-intro"><div><p className="eyebrow">ACCOUNT SETTINGS</p><h1>My profile</h1><p>Your registered BankEase account details.</p></div></div><div className="profile-grid"><div className="panel profile-card"><div className="large-avatar">{initials}</div><h2>{name}</h2><span>BankEase customer</span></div><div className="panel"><div className="section-header"><div><h3>Personal information</h3><p>Details provided during registration.</p></div></div><div className="profile-line"><UserRound size={17}/><span>{user?.username}</span></div><div className="profile-line"><Mail size={17}/><span>{user?.email}</span></div><div className="profile-line"><Phone size={17}/><span>{user?.phone}</span></div><div className="security-row"><ShieldCheck/><div><b>Security status</b><span>Requests to your banking data require your signed JWT.</span></div></div></div></div></div>;
}
