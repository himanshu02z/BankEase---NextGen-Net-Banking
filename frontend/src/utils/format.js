export const formatINR = (value) =>
  Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

export const maskAccount = (accountNumber) =>
  accountNumber ? `•••• ${accountNumber.slice(-4)}` : '';

export const initials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const isCredit = (type) => type === 'DEPOSIT' || type === 'TRANSFER_CREDIT';

export const typeLabel = {
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdrawal',
  TRANSFER_DEBIT: 'Transfer sent',
  TRANSFER_CREDIT: 'Transfer received',
};
