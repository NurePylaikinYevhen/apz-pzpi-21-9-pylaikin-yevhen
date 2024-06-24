import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from "./components/Sidebar";


const AdminLayout = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, ml: 30, mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;