import { useEffect, useState } from 'react';
import { Plus, WalletCards, RefreshCw } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { accountApi, transactionApi } from '../services/api';

const money = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);
const apiError = (error, fallback) => {
  const status = error.response?.status;
  const body = error.response?.data;
  const message = typeof body === 'string' ? body : body?.message;
  if (status === 401 || status === 403) return `Authentication failed (${status}). Sign out, sign in again, then retry.`;
  return message ? `${message}${status ? ` (HTTP ${status})` : ''}` : fallback;
};
export default function Accounts() {
  const { loading } = useAuth();
  const [accounts, setAccounts] = useState([]); const [busy, setBusy] = useState(true); const [error, setError] = useState('');
  const [transaction, setTransaction] = useState(null); const [amount, setAmount] = useState(''); const [transactionBusy, setTransactionBusy] = useState(false);
  if (loading) return null;
  const load = async () => { setBusy(true); try { setAccounts((await accountApi.getAccounts()).data); setError(''); } catch { setError('Could not load accounts. Please sign in again or check the backend.'); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  const create = async () => { try { await accountApi.create('SAVINGS'); await load(); } catch (e) { setError(apiError(e, 'Could not open account. Check that the backend is running.')); } };
  const transact = async (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;
    setTransactionBusy(true);
    try {
      await transactionApi[transaction.action](transaction.accountNumber, {
        amount: numericAmount,
        description: transaction.action === 'deposit' ? 'Cash deposit' : 'Cash withdrawal',
      });
      setTransaction(null);
      setAmount('');
      await load();
    } catch (e) {
      setError(apiError(e, `Could not ${transaction.action}.`));
    } finally {
      setTransactionBusy(false);
    }
  };
  return <div>
    <SectionHeader title="My accounts" subtitle="Live account balances from BankEase" action={<><button className="outline-btn" onClick={load}><RefreshCw size={16}/> Refresh</button><button className="primary-btn" onClick={create}><Plus size={17}/> Open savings account</button></>}/>
    {error && <p role="alert" className="form-error">{String(error)}</p>}
    {busy ? <p>Loading accounts…</p> : accounts.length === 0 ? <div className="panel"><p>You don’t have an account yet. Open a savings account to start banking.</p><button className="primary-btn" onClick={create}><Plus size={17}/> Open account</button></div> : <div className="accounts-grid">{accounts.map(a=><div className="account-detail panel" key={a.id}><div className="detail-head"><div className="account-symbol"><WalletCards/></div><div><h3>{a.accountType} account</h3><span>{a.active ? 'Active' : 'Inactive'} · {a.currency}</span></div></div><div className="detail-balance"><small>Available balance</small><h2>{money(a.balance)}</h2></div><div className="account-meta"><div><small>Account number</small><b>{a.accountNumber}</b></div><div><small>IFSC</small><b>{a.ifscCode}</b></div></div><div className="account-actions"><button className="outline-btn" onClick={()=>{setTransaction({accountNumber:a.accountNumber,action:'deposit'});setAmount('');setError('');}}>Deposit</button><button className="outline-btn" onClick={()=>{setTransaction({accountNumber:a.accountNumber,action:'withdraw'});setAmount('');setError('');}}>Withdraw</button></div></div>)}</div>}
    <Modal open={Boolean(transaction)} title={transaction ? `${transaction.action === 'deposit' ? 'Deposit to' : 'Withdraw from'} account` : ''} onClose={()=>{if(!transactionBusy)setTransaction(null);}}>
      {transaction && <form className="transfer-form" onSubmit={transact}>
        <p>Account ending in {transaction.accountNumber.slice(-4)}</p>
        <label>Amount (INR)<input type="number" min="0.01" step="0.01" required autoFocus value={amount} onChange={event=>setAmount(event.target.value)} placeholder="Enter amount"/></label>
        <button className="primary-btn full" type="submit" disabled={transactionBusy}>{transactionBusy ? 'Processing…' : `Confirm ${transaction.action}`}</button>
      </form>}
    </Modal>
  </div>;
}
