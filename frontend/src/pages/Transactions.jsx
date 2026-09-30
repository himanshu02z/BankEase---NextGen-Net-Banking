import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useAccounts } from '../context/AccountsContext';
import { transactionApi, errorMessage } from '../services/api';
import { isCredit } from '../utils/format';
import { TransactionTable } from './Dashboard';

export default function Transactions() {
  const { accounts } = useAccounts();
  const [account, setAccount] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!account && accounts.length) setAccount(accounts[0].accountNumber);
  }, [accounts, account]);

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    setError('');
    transactionApi
      .history(account)
      .then(({ data }) => setRows(data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [account]);

  const visible = rows
    .filter((t) => filter === 'ALL' || (filter === 'CREDIT' ? isCredit(t.type) : !isCredit(t.type)))
    .filter((t) => JSON.stringify(t).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="page-intro"><div><p className="eyebrow">ACCOUNT ACTIVITY</p><h1>Transactions</h1><p>Review your transaction history.</p></div></div>
      {error && <div className="alert error-alert">{error}</div>}
      <div className="panel">
        <div className="toolbar">
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            {accounts.map((a) => <option key={a.id} value={a.accountNumber}>{a.accountType} · {a.accountNumber}</option>)}
          </select>
          <div className="search"><Search size={17} /><input placeholder="Search transactions" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All transactions</option>
            <option value="CREDIT">Money received</option>
            <option value="DEBIT">Money spent</option>
          </select>
        </div>
        {!accounts.length ? <p className="empty">No accounts yet.</p> : loading ? <p className="empty">Loading…</p> : <TransactionTable rows={visible} />}
      </div>
    </div>
  );
}
