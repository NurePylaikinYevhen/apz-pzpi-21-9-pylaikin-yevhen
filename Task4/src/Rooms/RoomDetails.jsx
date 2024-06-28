import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Divider, CircularProgress, TableCell, TableBody,
    TableRow, TableHead, Table, TableContainer, Tooltip, IconButton, Snackbar,
    Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { useAuth } from "../AuthContext";
import { roomActions } from "../actions/roomActions";
import { configActions } from "../actions/configActions";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import StatisticsCard from "../components/StatisticCard";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

const RoomDetails = () => {
    const { id } = useParams();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [openConfigDialog, setOpenConfigDialog] = useState(false);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [configData, setConfigData] = useState({});
    const [schema, setSchema] = useState({});
    const [timeFrom, setTimeFrom] = useState(new Date());
    const [timeTo, setTimeTo] = useState(new Date());
    const [statistics, setStatistics] = useState(null);
    const [loadingStatistics, setLoadingStatistics] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();
    const { fetchRoomDevices, getRoomStatistics } = roomActions();
    const { exportConfig, importConfig, updateDeviceConfig } = configActions();

    const fetchRoomData = useCallback(async () => {
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
    }, [id, fetchRoomDevices, logout, navigate]);

    useEffect(() => {
        fetchRoomData();
    }, [id]);

    const loadStatictics = async () => {
        try {
            setLoadingStatistics(true);
            const response = await getRoomStatistics(id, timeFrom, timeTo);
            const adaptedStats = response.statistics.map(stat => ({
                ...stat,
                avg_co2: stat.avg_co2,
                median_co2: stat.median_co2,
                co2_deviation: stat.co2_deviation,
                avg_temperature: stat.avg_temperature,
                median_temperature: stat.median_temperature,
                temperature_deviation: stat.temperature_deviation,
                avg_humidity: stat.avg_humidity,
                median_humidity: stat.median_humidity,
                humidity_deviation: stat.humidity_deviation,
                avg_productivity: stat.avg_productivity,
                median_productivity: stat.median_productivity,
                productivity_deviation: stat.productivity_deviation
            }));
            setStatistics(adaptedStats);
            setError(null);
        } catch (error) {
            console.error('Помилка при завантаженні статистики:', error);
            setError('Помилка завантаження статистики. Спробуйте пізніше.');
        } finally {
            setLoadingStatistics(false);
        }
    };
    const handleOpenConfigDialog = async (deviceId) => {
        setCurrentDeviceId(deviceId);
        try {
            const config = await exportConfig(deviceId);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonConfig = JSON.parse(event.target.result);
                    setConfigData(jsonConfig);
                    setSchema(validateConfig(jsonConfig));
                    setOpenConfigDialog(true);
                } catch (error) {
                    setError('Помилка при парсингу конфігурації');
                }
            };
            reader.readAsText(config);
        } catch (error) {
            setError('Помилка при отриманні конфігурації');
        }
    };

    const validateConfig = (config) => {
        return {
            type: "object",
            properties: {
                ideal_values: {
                    type: "object",
                    properties: {
                        Temperature: { type: "number" },
                        Humidity: { type: "number" },
                        CO2: { type: "number" }
                    }
                },
                min_values: {
                    type: "object",
                    properties: {
                        Temperature: { type: "number" },
                        Humidity: { type: "number" },
                        CO2: { type: "number" }
                    }
                },
                max_values: {
                    type: "object",
                    properties: {
                        Temperature: { type: "number" },
                        Humidity: { type: "number" },
                        CO2: { type: "number" }
                    }
                },
                monitoring_settings: {
                    type: "object",
                    properties: {
                        Interval: { type: "number" }
                    }
                },
                productivity_norm: { type: "number" }
            }
        };
    };

    const handleCloseConfigDialog = () => {
        setOpenConfigDialog(false);
        setCurrentDeviceId(null);
        setConfigData({});
        setSchema({});
    };

    const handleSaveConfig = async (formData) => {
        try {
            const { device_id, ...configToSend } = formData;
            await updateDeviceConfig(currentDeviceId, configToSend);
            setSuccessMessage('Конфігурацію успішно оновлено');
            handleCloseConfigDialog();
            fetchRoomData();
        } catch (error) {
            console.error('Error saving config:', error);
            setError('Помилка при оновленні конфігурації: ' + (error.response?.data?.detail || error.message));
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
                setError('Помилка при імпорті конфігурації');
            }
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

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                                    <Tooltip title="Редагувати конфігурацію">
                                        <IconButton onClick={() => handleOpenConfigDialog(device.id)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            {device.measurements.length > 0 ? (
                                <TableContainer component={Paper} sx={{ mt: 2, mb: 4 }}>                                    <Table size="small">
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

                <Dialog open={openConfigDialog} onClose={handleCloseConfigDialog} maxWidth="md" fullWidth>
                    <DialogTitle>Редагування конфігурації пристрою {currentDeviceId}</DialogTitle>
                    <DialogContent>
                        <Form
                            schema={schema}
                            formData={configData}
                            validator={validator}
                            onSubmit={({ formData }) => handleSaveConfig(formData)}
                        >
                            <Button type="submit" style={{ display: 'none' }} />
                        </Form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfigDialog}>Відмінити</Button>
                        <Button
                            onClick={() => document.querySelector('button[type="submit"]').click()}
                        >
                            Зберегти
                        </Button>
                    </DialogActions>
                </Dialog>

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
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 3 }}>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        <Grid item>
                            <DateTimePicker
                                label="Від"
                                value={timeFrom}
                                onChange={setTimeFrom}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Grid>
                        <Grid item>
                            <DateTimePicker
                                label="До"
                                value={timeTo}
                                onChange={setTimeTo}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={loadStatictics}
                                disabled={loadingStatistics}
                            >
                                {loadingStatistics ? 'Завантаження...' : 'Отримати статистику'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {loadingStatistics && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                )}

                {statistics && (
                    <Grid container spacing={3}>
                        {statistics.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <StatisticsCard
                                    title={`Статистика для ${stat.device_id}`}
                                    data={stat}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default RoomDetails;