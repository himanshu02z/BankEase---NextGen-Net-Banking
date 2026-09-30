import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:8080/api',headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(config=>{const token=localStorage.getItem('bankease_token');if(token) config.headers.Authorization=`Bearer ${token}`;return config});
export const authApi={login:(data)=>api.post('/auth/login',data),register:(data)=>api.post('/auth/register',data)};
export const accountApi={getAccounts:()=>api.get('/accounts'),getBalance:(id)=>api.get(`/accounts/${id}/balance`)};
export const transactionApi={transfer:(data)=>api.post('/transfers',data),history:()=>api.get('/transactions')};
export default api;
