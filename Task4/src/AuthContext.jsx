import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [myRole, setMyRole] = useState('');

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            checkAuth();
        }
    }, [token]);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setIsLoggedIn(true);
            setUsername(response.data.username);
            setMyRole(response.data.role);
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/auth/login', {
                username,
                password,
                grant_type: 'password',
                scope: '',
                client_id: '',
                client_secret: ''
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const newToken = response.data.access_token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            await checkAuth();
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsLoggedIn(false);
        setUsername('');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, login, logout, token, myRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);