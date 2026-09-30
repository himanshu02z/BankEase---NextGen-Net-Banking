import { useEffect, useState } from 'react';
import { Send, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Modal from '../components/Modal';
import { useAccounts } from '../context/AccountsContext';
import { transactionApi, errorMessage } from '../services/api';
import { formatINR } from '../utils/format';

export default function Transfer() {
  const { accounts, refresh } = useAccounts();
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    if (!sender && accounts.length) setSender(accounts[0].accountNumber);
  }, [accounts, sender]);

  const senderAccount = accounts.find((a) => a.accountNumber === sender);

  const review = (e) => {
    e.preventDefault();
    setError('');
    setDone('');
    if (receiver.trim() === sender) {
      setError('Sender and receiver accounts cannot be the same');
      return;
    }
    setOpen(true);
  };

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await transactionApi.transfer(sender, {
        receiverAccountNumber: receiver.trim(),
        amount: Number(amount),
        description: description || null,
      });
      setDone(`${formatINR(amount)} sent to ${receiver.trim()}`);
      setReceiver('');
      setAmount('');
      setDescription('');
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div>
      <div className="page-intro"><div><p className="eyebrow">PAYMENTS</p><h1>Fund transfer</h1><p>Send money securely to any BankEase account.</p></div></div>
      {done && <div className="success-banner"><CheckCircle2 /> <div><b>Transfer successful</b><span>{done}</span></div></div>}
      {error && <div className="alert error-alert">{error}</div>}
      {!accounts.length ? (
        <div className="panel"><p className="empty">Open an account first to make transfers.</p></div>
      ) : (
        <div className="transfer-grid">
          <form className="panel transfer-form" onSubmit={review}>
            <div className="step"><span>1</span><div><h3>From account</h3><p>Choose the account to debit.</p></div></div>
            <label>From
              <select value={sender} onChange={(e) => setSender(e.target.value)}>
                {accounts.map((a) => <option key={a.id} value={a.accountNumber}>{a.accountType} · {a.accountNumber} · {formatINR(a.balance)}</option>)}
              </select>
            </label>
            <div className="step"><span>2</span><div><h3>Transfer details</h3><p>Enter receiver account number and amount.</p></div></div>
            <label>Receiver account number<input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="12-digit account number" required /></label>
            <label>Amount<input className="amount-input" type="number" min="0.01" step="0.01" placeholder="₹ 0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
            <label>Payment note <span className="optional">Optional</span><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Rent" /></label>
            <button className="primary-btn full" type="submit">Review transfer <ArrowRight size={18} /></button>
          </form>
          <div className="panel transfer-side">
            <div className="side-icon"><ShieldCheck /></div>
            <h3>Secure transfer</h3>
            <p>Debit and credit happen in a single database transaction with row-level locking.</p>
            <ul><li>JWT-authenticated request</li><li>Ownership & balance checks</li><li>Atomic debit/credit records</li></ul>
            <div className="balance-box"><span>Available balance</span><b>{formatINR(senderAccount?.balance)}</b></div>
          </div>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Confirm transfer">
        <div className="confirm">
          <div className="confirm-row"><span>From</span><b>{sender}</b></div>
          <div className="confirm-row"><span>To</span><b>{receiver}</b></div>
          <div className="confirm-row"><span>Amount</span><strong>{formatINR(amount)}</strong></div>
          <button className="primary-btn full" onClick={confirm} disabled={busy}>{busy ? 'Processing…' : <>Confirm & transfer <Send size={17} /></>}</button>
        </div>
      </Modal>
    </div>
  );
}
