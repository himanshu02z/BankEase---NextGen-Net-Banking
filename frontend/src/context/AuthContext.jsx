import { createContext, useContext, useState } from 'react';
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('bankease_user')||'null'));
 const login=(email)=>{const u={name:'Himanshu Pachouri',email,account:'•••• 4821',role:'CUSTOMER'};localStorage.setItem('bankease_user',JSON.stringify(u));setUser(u)};
 const logout=()=>{localStorage.removeItem('bankease_user');setUser(null)};
 return <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
