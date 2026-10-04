import { useState } from 'react';
import { CreditCard, Wallet, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../context/AccountsContext';
import { accountApi, transactionApi, errorMessage } from '../services/api';
import { formatINR, formatDate } from '../utils/format';

export default function Accounts() {
  const { user } = useAuth();
  const { accounts, loading, error, refresh } = useAccounts();
  const [openNew, setOpenNew] = useState(false);
  const [accountType, setAccountType] = useState('SAVINGS');
  const [action, setAction] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');

  const createAccount = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const { data } = await accountApi.createAccount(accountType);
      setMessage(`Account ${data.accountNumber} opened successfully.`);
      setOpenNew(false);
      await refresh();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitAction = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const payload = { amount: Number(amount), description: description || null };
      const call = action.type === 'deposit' ? transactionApi.deposit : transactionApi.withdraw;
      const { data } = await call(action.account.accountNumber, payload);
      setMessage(`${action.type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${formatINR(data.amount)} successful. New balance ${formatINR(data.balanceAfter)}.`);
      setAction(null);
      setAmount('');
      setDescription('');
      await refresh();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const openAction = (type, account) => {
    setFormError('');
    setAmount('');
    setDescription('');
    setAction({ type, account });
  };

  return (
    <div>
      <SectionHeader
        title="My accounts"
        subtitle="Manage all your BankEase accounts"
        action={<button className="primary-btn" onClick={() => { setFormError(''); setOpenNew(true); }}><Plus size={17} /> Open account</button>}
      />
      {message && <div className="alert success-alert">{message}</div>}
      {error && <div className="alert error-alert">{error}</div>}
      {loading && <p className="empty">Loading accounts…</p>}
      {!loading && !accounts.length && <div className="panel"><p className="empty">You don’t have an account yet. Click “Open account” to create one.</p></div>}
      {accounts.map((a) => (
        <div className="accounts-grid" key={a.id}>
          <div className="bank-card dark">
            <div className="card-top"><span>BankEase</span><CreditCard size={23} /></div>
            <p>{a.accountType} ACCOUNT</p>
            <strong>{formatINR(a.balance)}</strong>
            <div className="card-bottom"><span>{(user?.fullName || user?.username || '').toUpperCase()}</span><span>•••• {a.accountNumber.slice(-4)}</span></div>
          </div>
          <div className="account-detail">
            <div className="detail-head">
              <div className="account-symbol"><Wallet /></div>
              <div><h3>{a.accountType === 'SAVINGS' ? 'Savings Account' : 'Current Account'}</h3><span>{a.active ? 'Active' : 'Inactive'} · {a.currency}</span></div>
            </div>
            <div className="detail-balance"><small>Available balance</small><h2>{formatINR(a.balance)}</h2></div>
            <div className="account-meta">
              <div><small>Account number</small><b>{a.accountNumber}</b></div>
              <div><small>IFSC</small><b>{a.ifscCode}</b></div>
              <div><small>Opened</small><b>{formatDate(a.createdAt)}</b></div>
            </div>
            <div className="action-row">
              <button className="primary-btn" onClick={() => openAction('deposit', a)}><ArrowDownLeft size={16} /> Deposit</button>
              <button className="outline-btn" onClick={() => openAction('withdraw', a)}><ArrowUpRight size={16} /> Withdraw</button>
            </div>
          </div>
        </div>
      ))}

      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Open a new account">
        <form className="modal-form" onSubmit={createAccount}>
          {formError && <div className="alert error-alert">{formError}</div>}
          <label>Account type
            <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </select>
          </label>
          <button className="primary-btn full" type="submit" disabled={busy}>{busy ? 'Opening…' : 'Open account'}</button>
        </form>
      </Modal>

      <Modal open={!!action} onClose={() => setAction(null)} title={action?.type === 'deposit' ? 'Deposit money' : 'Withdraw money'}>
        {action && (
          <form className="modal-form" onSubmit={submitAction}>
            {formError && <div className="alert error-alert">{formError}</div>}
            <div className="confirm-row"><span>Account</span><b>{action.account.accountNumber}</b></div>
            <div className="confirm-row"><span>Current balance</span><b>{formatINR(action.account.balance)}</b></div>
            <label>Amount (₹)<input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
            <label>Description <span className="optional">Optional</span><input value={description} onChange={(e) => setDescription(e.target.value)} /></label>
            <button className="primary-btn full" type="submit" disabled={busy}>{busy ? 'Processing…' : action.type === 'deposit' ? 'Deposit' : 'Withdraw'}</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
