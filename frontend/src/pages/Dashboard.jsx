import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Send, Plus, WalletCards, ReceiptText } from 'lucide-react';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../context/AccountsContext';
import { transactionApi, errorMessage } from '../services/api';
import { formatINR, formatDate, maskAccount, isCredit, typeLabel } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const { accounts, totalBalance, loading, error } = useAccounts();
  const [recent, setRecent] = useState([]);
  const [txError, setTxError] = useState('');
  const primary = accounts[0];

  useEffect(() => {
    if (!primary) return;
    transactionApi
      .history(primary.accountNumber)
      .then(({ data }) => setRecent(data.slice(0, 5)))
      .catch((e) => setTxError(errorMessage(e)));
  }, [primary]);

  const received = recent.filter((t) => isCredit(t.type)).reduce((s, t) => s + Number(t.amount), 0);
  const spent = recent.filter((t) => !isCredit(t.type)).reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div>
      <div className="welcome">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</p>
          <h1>Hello, {user?.fullName?.split(' ')[0] || user?.username}</h1>
          <p>Here’s your financial overview.</p>
        </div>
      </div>
      {error && <div className="alert error-alert">{error}</div>}
      <div className="stats-grid">
        <StatCard icon={WalletCards} label="Total balance" value={loading ? '…' : formatINR(totalBalance)} meta={`${accounts.length} account(s)`} />
        <StatCard icon={ArrowDownLeft} label="Recent credits" value={formatINR(received)} meta="Last 5 transactions" up />
        <StatCard icon={ArrowUpRight} label="Recent debits" value={formatINR(spent)} meta="Last 5 transactions" />
        <StatCard icon={ReceiptText} label="Primary account" value={primary ? maskAccount(primary.accountNumber) : '—'} meta={primary?.accountType || 'No account yet'} />
      </div>
      <div className="dashboard-grid">
        <div className="panel">
          <SectionHeader title="Quick actions" subtitle="Common banking services" />
          <div className="quick-grid">
            <Link to="/transfer"><span className="quick-icon blue"><Send /></span><b>Send money</b><small>Transfer funds</small></Link>
            <Link to="/accounts"><span className="quick-icon green"><Plus /></span><b>Deposit / Withdraw</b><small>Manage balance</small></Link>
            <Link to="/accounts"><span className="quick-icon purple"><WalletCards /></span><b>My accounts</b><small>View or open</small></Link>
            <Link to="/transactions"><span className="quick-icon orange"><ReceiptText /></span><b>History</b><small>All transactions</small></Link>
          </div>
        </div>
        <div className="panel balance-panel">
          <SectionHeader title="Primary account" />
          {primary ? (
            <>
              <div className="account-number">{primary.accountType} Account <span>{primary.accountNumber}</span></div>
              <div className="big-balance">{formatINR(primary.balance)}</div>
              <div className="balance-foot"><span>Available balance</span><span>IFSC {primary.ifscCode}</span></div>
            </>
          ) : (
            <p className="account-number">{loading ? 'Loading…' : <>No account yet. <Link className="text-link" to="/accounts">Open one</Link></>}</p>
          )}
        </div>
      </div>
      <div className="panel">
        <SectionHeader title="Recent transactions" subtitle="Latest activity on your primary account" action={<Link className="text-link" to="/transactions">View all →</Link>} />
        {txError && <div className="alert error-alert">{txError}</div>}
        <TransactionTable rows={recent} />
      </div>
    </div>
  );
}

export function TransactionTable({ rows }) {
  if (!rows.length) return <p className="empty">No transactions yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Transaction</th><th>Date</th><th>Reference</th><th>Amount</th><th>Balance after</th></tr></thead>
        <tbody>
          {rows.map((t) => {
            const credit = isCredit(t.type);
            return (
              <tr key={t.id}>
                <td>
                  <div className="tx-name">
                    <div className={'tx-avatar ' + (credit ? 'credit' : 'debit')}>{credit ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</div>
                    <div>
                      <b>{typeLabel[t.type] || t.type}</b>
                      <small>{t.description}{t.relatedAccountNumber ? ` · ${t.relatedAccountNumber}` : ''}</small>
                    </div>
                  </div>
                </td>
                <td>{formatDate(t.createdAt)}</td>
                <td>{t.transactionReference}</td>
                <td className={credit ? 'amount credit' : 'amount'}>{credit ? '+' : '−'} {formatINR(t.amount)}</td>
                <td>{formatINR(t.balanceAfter)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
