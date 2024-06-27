import React, {useEffect} from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from "./LandingPage/landingpage";
import {AuthProvider, useAuth} from "./AuthContext";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import {Route, BrowserRouter, Routes, Router, Navigate} from "react-router-dom";
import {Box, CircularProgress} from "@mui/material";
import Person from "./Person/Person";
import Rooms from "./Rooms/Rooms";
import RoomDetails from "./Rooms/RoomDetails";
import Devices from "./Devices/Devices";
import CustomAppBar from "./components/AppBar";
import AdminLayout from "./AdminLayout";
import UserManagement from "./Person/UserManagement";

axios.defaults.baseURL = 'http://localhost:5000';

//Обробник помилок
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location = '/';
        }
        return Promise.reject(error);
    }
);
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

const AuthOnly = ({ children, adminOnly = false }) => {
    const { isLoggedIn, isLoading, myRole } = useAuth();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isLoggedIn || (adminOnly && myRole !== 'admin')) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <CustomAppBar />
                        <Box component="main" sx={{ flexGrow: 1, mt: 8 }}>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/admin" element={
                                    <AuthOnly>
                                        <AdminLayout />
                                    </AuthOnly>
                                }>
                                    <Route path="account" element={<Person />} />
                                    <Route path="rooms" element={<Rooms />} />
                                    <Route path="rooms/:id" element={<RoomDetails />} />
                                    <Route path="devices" element={<Devices />} />
                                    <Route path="users" element={
                                        <AuthOnly requiredRole="admin">
                                            <UserManagement />
                                        </AuthOnly>
                                    } />
                                </Route>
                            </Routes>
                        </Box>
                    </Box>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
