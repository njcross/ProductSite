import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const API_BASE = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`/api/check-login`, {
          headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include', 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.loggedIn) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Login check failed:', err);
        setCurrentUser(null);
      }
    };
  
    checkLogin();
  }, [API_BASE]);
  

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
