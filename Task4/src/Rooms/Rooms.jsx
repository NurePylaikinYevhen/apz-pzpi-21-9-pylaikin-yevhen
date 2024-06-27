import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    IconButton,
    Snackbar,
    Alert, TextField
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RoomCreationComponent from "../components/createRoom";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import {roomActions} from "../actions/roomActions";
import StatisticsCard from "../components/StatisticCard";


const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [showCreation, setShowCreation] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [timeFrom, setTimeFrom] = useState(new Date());
    const [timeTo, setTimeTo] = useState(new Date());
    const [statistics, setStatistics] = useState(null);

    const { fetchRooms, deleteRoom, getAllStatistics } = roomActions();

    useEffect(() => {
        loadRooms().catch(error => console.log(error));
    }, []);

    useEffect(() => {
        loadRooms();
        loadStatistics();
    }, [timeFrom, timeTo]);

    const loadStatistics = async () => {
        try {
            const statistic = await getAllStatistics(timeFrom, timeTo)
            setStatistics(statistic.data);
        } catch (error) {
            setError(`Не вдалося завантажити статистику. ${error}`);
        }
    };

    const loadRooms = async () => {
        try {
            const fetchedRooms = await fetchRooms();
            setRooms(fetchedRooms);
        } catch (error) {
            setError(`Не вдалося завантажити кімнати. ${error}`);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteRoom(roomId);
            await loadRooms();
            setSuccessMessage('Кімнату успішно видалено');
        } catch (error) {
            setError(`Не вдалося видалити кімнату ${error}`);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setError(null);
        setSuccessMessage(null);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>Кімнати</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowCreation(true)}
                    sx={{ mb: 3 }}
                >
                    Додати кімнату
                </Button>
                {showCreation && (
                    <Box mt={3}>
                        <RoomCreationComponent
                            onClose={async () => {
                                setShowCreation(false);
                                await loadRooms();
                            }}
                        />
                    </Box>
                )}
                <Grid container spacing={3} style={{ marginTop: '20px' }}>
                    {rooms.map((room) => (
                        <Grid item xs={12} sm={6} md={4} key={room.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="caption" color="text.secondary">
                                        ID: {room.id}
                                    </Typography>
                                    <IconButton
                                        sx={{ float: 'right' }}
                                        onClick={() => handleDeleteRoom(room.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <Typography variant="h6" component="div">
                                        {room.name}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        component={Link}
                                        to={`/admin/rooms/${room.id}`}
                                        size="small"
                                        fullWidth
                                    >
                                        Перейти до кімнати
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
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

                <Grid container spacing={2} sx={{ mb: 3 }}>
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
                </Grid>

                {statistics && (
                    <Grid container spacing={3}>
                        {statistics.map((stat, index) => (
                            <Grid item xs={12} key={index}>
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

export default Rooms;