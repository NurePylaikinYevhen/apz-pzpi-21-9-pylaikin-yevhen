import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const Person = () => {
    const { username } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Паролі не співпадають');
            return;
        }
        try {
            await axios.put('/api/auth/password', { new_password: newPassword });
            setError('');
            setNewPassword('');
            setConfirmPassword('');
            alert('Пароль успішно змінено');
        } catch (error) {
            setError('Помилка при зміні пароля');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Аккаунт: {username}</Typography>
                <form onSubmit={handleChangePassword}>
                    <TextField
                        fullWidth
                        type="password"
                        label="Новий пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        type="password"
                        label="Підтвердження пароля"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        margin="normal"
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                        Змінити пароль
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Person;