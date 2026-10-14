import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { accountApi, transactionApi } from '../services/api';

const money = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);
export default function Transactions() {
  const { loading } = useAuth();
  const [accounts,setAccounts]=useState([]); const [account,setAccount]=useState(''); const [rows,setRows]=useState([]); const [q,setQ]=useState(''); const [error,setError]=useState('');
  if (loading) return null;
  useEffect(()=>{accountApi.getAccounts().then(async ({data})=>{setAccounts(data); if(data[0]){setAccount(data[0].accountNumber);setRows((await transactionApi.history(data[0].accountNumber)).data);}}).catch(()=>setError('Could not load account activity.'));},[]);
  const select=async (n)=>{setAccount(n);try{setRows((await transactionApi.history(n)).data);setError('')}catch{setError('Could not load transaction history.')}};
  const filtered=rows.filter(t=>`${t.type} ${t.description||''} ${t.relatedAccountNumber||''}`.toLowerCase().includes(q.toLowerCase()));
  return <div><div className="page-intro"><div><p className="eyebrow">ACCOUNT ACTIVITY</p><h1>Transactions</h1><p>Live transaction history from your accounts.</p></div></div>{error&&<p role="alert" className="form-error">{error}</p>}<div className="panel"><div className="toolbar"><select value={account} onChange={e=>select(e.target.value)}>{accounts.map(a=><option key={a.id} value={a.accountNumber}>{a.accountType} · {a.accountNumber}</option>)}</select><div className="search"><Search size={17}/><input placeholder="Search transactions" value={q} onChange={e=>setQ(e.target.value)}/></div></div>{filtered.length===0?<p>No transactions found for this account.</p>:<div className="table-wrap"><table><thead><tr><th>Transaction</th><th>Date</th><th>Type</th><th>Related account</th><th>Amount</th></tr></thead><tbody>{filtered.map(t=>{const credit=t.type==='DEPOSIT'||t.type==='TRANSFER_CREDIT';return <tr key={t.id}><td><div className="tx-name"><div className={`tx-avatar ${credit?'credit':'debit'}`}>{credit?<ArrowDownLeft size={17}/>:<ArrowUpRight size={17}/>}</div><div><b>{t.description||t.type}</b><small>{t.transactionReference}</small></div></div></td><td>{new Date(t.createdAt).toLocaleString()}</td><td>{t.type.replaceAll('_',' ')}</td><td>{t.relatedAccountNumber||'—'}</td><td className={credit?'amount credit':'amount'}>{credit?'+':'−'}{money(t.amount)}</td></tr>})}</tbody></table></div>}</div></div>;
}
