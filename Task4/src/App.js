import React, {useEffect} from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from "./LandingPage/landingpage";
import {AuthProvider, useAuth} from "./AuthContext";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import {Route, BrowserRouter, Routes, Router} from "react-router-dom";
import {Box} from "@mui/material";
import Person from "./Person/Person";
import Rooms from "./Rooms/Rooms";
import RoomDetails from "./Rooms/RoomDetails";
import Devices from "./Devices/Devices";
import CustomAppBar from "./components/AppBar";
import AdminLayout from "./AdminLayout";

axios.defaults.baseURL = 'http://localhost:5000';
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
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route path="account" element={<Person />} />
                                    <Route path="rooms" element={<Rooms />} />
                                    <Route path="rooms/:id" element={<RoomDetails />} />
                                    <Route path="devices" element={<Devices />} />
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
