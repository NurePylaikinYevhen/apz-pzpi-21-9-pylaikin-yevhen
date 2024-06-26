import React, { useState, useEffect } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    TableCell, TableBody, TableRow, TableHead, Table, TableContainer, Tooltip, IconButton, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import {useAuth} from "../AuthContext";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {roomActions} from "../actions/roomActions";

const RoomDetails = () => {
    const { id } = useParams();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { fetchRoomDevices, exportConfig, importConfig } = roomActions();

    useEffect(() => {
        fetchRoomData();
    }, [id]);

    const fetchRoomData = async () => {
        try {
            setLoading(true);
            const devicesData = await fetchRoomDevices(id);
            setDevices(devicesData);
            setError(null);
        } catch (error) {
            console.error('Помилка при завантаженні кімнати:', error);
            if (error.response && error.response.status === 401) {
                logout();
                navigate('/login');
            } else {
                setError('Помилка завантаження даних кімнати. Спробуйте пізніше.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExportConfig = async (deviceId = null) => {
        try {
            const blob = await exportConfig(deviceId);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `config_${deviceId ? `device_${deviceId}` : 'all'}_${new Date().toISOString()}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setSuccessMessage('Конфігурацію успішно експортовано');
        } catch (error) {
            setError('Помилка при експорті конфігурації');
        }
    };

    const handleImportConfig = async (deviceId = null, event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await importConfig(file, deviceId);
                setSuccessMessage('Конфігурацію успішно імпортовано');
                fetchRoomData();
            } catch (error) {
                setError('Помилка при імпорті конфігурації');            }
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setError(null);
        setSuccessMessage(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (devices.length === 0) {
        return <Typography>У цій кімнаті немає пристроїв.</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">Кімната: {id}</Typography>
                    <Box>
                        <Tooltip title="Експорт всіх конфігурацій">
                            <IconButton onClick={() => handleExportConfig()}>
                                <CloudDownloadIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Імпорт всіх конфігурацій">
                            <IconButton component="label">
                                <CloudUploadIcon />
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => handleImportConfig(null, e)}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Пристрої та вимірювання:</Typography>
                {devices.map((device) => (
                    <Box key={device.id} sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1">
                                Device ID: {device.id}, MAC: {device.mac_address}
                            </Typography>
                            <Box>
                                <Tooltip title="Експорт конфігурації">
                                    <IconButton onClick={() => handleExportConfig(device.id)}>
                                        <CloudDownloadIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Імпорт конфігурації">
                                    <IconButton component="label">
                                        <CloudUploadIcon />
                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) => handleImportConfig(device.id, e)}
                                        />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        {device.measurements.length > 0 ? (
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Час</TableCell>
                                            <TableCell align="right">Температура (°C)</TableCell>
                                            <TableCell align="right">Вологість (%)</TableCell>
                                            <TableCell align="right">CO2 (ppm)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {device.measurements.map((measurement) => (
                                            <TableRow key={measurement.id}>
                                                <TableCell component="th" scope="row">
                                                    {new Date(measurement.timestamp).toLocaleString()}
                                                </TableCell>
                                                <TableCell align="right">{measurement.temperature}</TableCell>
                                                <TableCell align="right">{measurement.humidity}</TableCell>
                                                <TableCell align="right">{measurement.co2}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography>Немає вимірювань для цього пристрою.</Typography>
                        )}
                    </Box>
                ))}
            </Paper>
            <Snackbar open={!!error} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>        </Box>
    );
};

export default RoomDetails;