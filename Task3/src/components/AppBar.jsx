import React, {useState} from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {useAuth} from "../AuthContext";
import LoginModal from "./LoginModal";
import {useLocation, useNavigate} from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';


const CustomAppBar = () => {
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, logout, login } = useAuth();

    const isAdminPage = location.pathname.startsWith('/admin');
    const isHomePage = location.pathname === '/';

    const handleOpenLoginModal = () => setOpenLoginModal(true);
    const handleCloseLoginModal = () => setOpenLoginModal(false);
    const handleBackClick = () => navigate('/');
    const handleAdminClick = () => navigate('/admin');
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleLogin = async (username, password) => {
        const success = await login(username, password);
        if (success) {
            handleCloseLoginModal();
             navigate('/admin');
        }
    };

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    {isAdminPage && (
                        <IconButton edge="start" color="inherit" onClick={handleBackClick} sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        EcoSystem
                    </Typography>
                    {isHomePage && isLoggedIn && (
                        <Button color="inherit" startIcon={<DashboardIcon />} onClick={handleAdminClick}>
                            Адмін панель
                        </Button>
                    )}
                    {isLoggedIn ? (
                        <Button color="inherit" onClick={handleLogout}>Вийти</Button>
                    ) : (
                        <Button color="inherit" onClick={handleOpenLoginModal}>Увійти</Button>
                    )}
                </Toolbar>
            </AppBar>
            <LoginModal
                open={openLoginModal}
                handleClose={handleCloseLoginModal}
                handleLogin={handleLogin}
            />
        </>
    );
};

export default CustomAppBar;