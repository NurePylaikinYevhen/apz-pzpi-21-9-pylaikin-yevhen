import React, {createContext, useState, useContext, useEffect, useCallback} from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [myRole, setMyRole] = useState('');

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            checkAuth();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const checkAuth = async () => {
        const currentToken = token || localStorage.getItem('token');
        if (!currentToken) {
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.get('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            console.log('Auth check response:', response.data);
            setIsLoggedIn(true);
            setUsername(response.data.username);
            setMyRole(response.data.role);
        } catch (error) {
            console.error('Auth check failed:', error.response ? error.response.data : error);
            logout();
        } finally {
            setIsLoading(false);
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
            console.log('Login response:', response.data);
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
        setMyRole('');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoading, username, login, logout, token, myRole }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);