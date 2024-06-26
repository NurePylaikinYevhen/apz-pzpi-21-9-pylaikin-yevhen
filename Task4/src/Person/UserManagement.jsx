import React, {useState, useEffect, useCallback} from 'react';
import {
    Box,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Typography, Snackbar, Alert, CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import SearchBar from "../components/SearchBar";
import {userManagementActions} from "../actions/userManagementActions";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { myRole } = useAuth();
    const { fetchUsers, changeUserRole, banUser, unbanUser } = userManagementActions();

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await fetchUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            setError(`Помилка при завантаженні ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserAction = useCallback(async (action, username) => {
        setIsLoading(true);
        try {
            let response;
            switch (action) {
                case 'promote':
                    response = await changeUserRole(username, 'admin');
                    break;
                case 'ban':
                    response = await banUser(username);
                    break;
                case 'unban':
                    response = await unbanUser(username);
                    break;
            }
            setSuccessMessage(response.message);
            await loadUsers();
        } catch (error) {
            setError(`Помилка дії ${action}. ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [changeUserRole, banUser, unbanUser, loadUsers]);

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setError(null);
        setSuccessMessage(null);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Управління користувачами</Typography>
            <SearchBar
                value={searchTerm}
                onChange={handleSearch}
                label="Пошук користувачів"
            />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ім'я</TableCell>
                            <TableCell>Роль</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Дії</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.is_banned ? 'Заблокований' : 'Активний'}</TableCell>
                                <TableCell>
                                    {myRole == 'admin' && user.role === 'manager' && (
                                        <Button onClick={() => handleUserAction('promote', user.username)}>
                                            Повисити до адміна
                                        </Button>
                                    )}
                                    {myRole == 'admin' && user.role === 'manager' && (
                                        user.is_banned ? (
                                            <Button onClick={() => handleUserAction('unban', user.username)}>Unban</Button>
                                        ) : (
                                            <Button onClick={() => handleUserAction('ban', user.username)}>Ban</Button>
                                        )
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Snackbar open={!!error} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement;