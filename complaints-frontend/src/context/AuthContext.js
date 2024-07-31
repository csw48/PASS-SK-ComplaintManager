import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authToken) {
        try {
          const response = await axios.get('http://localhost:8000/api/users/', {
            headers: {
              Authorization: `Token ${authToken}`
            }
          });
          setUser(response.data[0]);
        } catch (error) {
          console.error('Failed to fetch user data', error);
        }
      }
    };
    fetchUserData();
  }, [authToken]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        username,
        password
      });
      setAuthToken(response.data.token);
      localStorage.setItem('authToken', response.data.token);
      const userResponse = await axios.get('http://localhost:8000/api/users/', {
        headers: {
          Authorization: `Token ${response.data.token}`
        }
      });
      setUser(userResponse.data[0]);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const authAxios = axios.create({
    baseURL: 'http://localhost:8000',
  });

  authAxios.interceptors.request.use(
    config => {
      if (authToken) {
        config.headers.Authorization = `Token ${authToken}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ authToken, user, login, logout, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
};