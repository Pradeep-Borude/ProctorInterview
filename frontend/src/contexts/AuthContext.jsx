import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // AuthContext.jsx - Updated
useEffect(() => {
  fetch("http://localhost:3000/api/auth/me", {
    credentials: "include",
  })
    .then(res => {
      if (!res.ok) throw new Error('Backend offline');
      return res.json();
    })
    .then(data => {
      setUser(data?.user || null);
      setLoading(false);
    })
    .catch((error) => {
      console.log('Backend not running, redirecting to login');
      setUser(null);
      setLoading(false);
    });
}, []);


  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
