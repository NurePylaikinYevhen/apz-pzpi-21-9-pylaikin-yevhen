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
    TableCell, TableBody, TableRow, TableHead, Table, TableContainer, Tooltip, IconButton
} from '@mui/material';
import axios from 'axios';
import {useAuth} from "../AuthContext";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const RoomDetails = () => {
    const { id } = useParams();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        fetchRoomDetails();
    }, [id]);

    const fetchRoomDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/rooms/${id}/devices`);
            setDevices(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching room details:', error);
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
            const url = deviceId
                ? `/api/admin/config/export?device_id=${deviceId}`
                : '/api/admin/config/export';
            const response = await axios.get(url, { responseType: 'blob' });
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `config_${deviceId ? `device_${deviceId}` : 'all'}_${new Date().toISOString()}.json`;
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting config:', error);
            // Тут в майбутньому буде обробка помилок, наприклад, показ повідомлення користувачу
        }
    };

    const handleImportConfig = async (deviceId = null, event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const url = deviceId
                    ? `/api/admin/config/import?device_id=${deviceId}`
                    : '/api/admin/config/import';
                await axios.post(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                // Тут буде оновлення даних після успішного імпорту
                fetchRoomDetails();
            } catch (error) {
                console.error('Error importing config:', error);
                // Тут в майбутньому буде обробка помилок, наприклад, показ повідомлення користувачу
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
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
        </Box>
    );
};

export default RoomDetails;