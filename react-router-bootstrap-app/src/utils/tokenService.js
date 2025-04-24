// src/utils/tokenService.js

// Save token to localStorage
export const setToken = (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    }
  };
  
  // Retrieve token from localStorage
  export const getToken = () => {
    return localStorage.getItem('authToken');
  };
  
  // Remove token from localStorage
  export const removeToken = () => {
    localStorage.removeItem('authToken');
  };
  
  // Optional: Check if token exists
  export const isLoggedIn = () => {
    return !!getToken();
  };
  