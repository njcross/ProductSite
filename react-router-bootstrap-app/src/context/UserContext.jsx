import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/check-login', {
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
  }, []);
  

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
