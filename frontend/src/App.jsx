import {Navigate,Route,Routes} from 'react-router-dom';
import {useAuth} from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import Bills from './pages/Bills';
import Loans from './pages/Loans';
import Investments from './pages/Investments';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
function Private(){const {user}=useAuth();return user?<DashboardLayout/>:<Navigate to="/login" replace/>}
export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route path="/" element={<Private/>}><Route index element={<Dashboard/>}/><Route path="accounts" element={<Accounts/>}/><Route path="transfer" element={<Transfer/>}/><Route path="transactions" element={<Transactions/>}/><Route path="bills" element={<Bills/>}/><Route path="loans" element={<Loans/>}/><Route path="investments" element={<Investments/>}/><Route path="notifications" element={<Notifications/>}/><Route path="profile" element={<Profile/>}/><Route path="admin" element={<Admin/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
