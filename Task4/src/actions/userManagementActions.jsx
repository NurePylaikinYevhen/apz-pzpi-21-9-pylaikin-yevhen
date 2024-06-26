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
            const response = await axios.get(`/admin/change_role/${username}?role=${role}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const banUser = async (username) => {
        try {
            const response = await axios.post(`/admin/ban/${username}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const unbanUser = async (username) => {
        try {
            const response = await axios.post(`/admin/unban/${username}`);
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
    };
};
