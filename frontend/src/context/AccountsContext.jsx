import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { accountApi, errorMessage } from '../services/api';

const AccountsContext = createContext(null);

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await accountApi.getAccounts();
      setAccounts(data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  return (
    <AccountsContext.Provider value={{ accounts, loading, error, refresh, totalBalance }}>
      {children}
    </AccountsContext.Provider>
  );
}

export const useAccounts = () => useContext(AccountsContext);
