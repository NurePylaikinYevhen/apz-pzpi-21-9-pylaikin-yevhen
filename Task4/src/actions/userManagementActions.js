import { useState, useCallback } from 'react';
import axios from 'axios';

export const userManagementActions = () => {
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/admin/users');
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const changeUserRole = async (username, role) => {
        try {
            const response = await axios.post('/api/admin/change_role', { username, role });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const banUser = async (username) => {
        try {
            const response = await axios.post(`/api/admin/ban/${username}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const unbanUser = async (username) => {
        try {
            const response = await axios.post(`/api/admin/unban/${username}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const registerUser = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        fetchUsers,
        changeUserRole,
        banUser,
        unbanUser,
        registerUser
    };
};
