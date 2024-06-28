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
import {roomActions} from "../actions/roomActions";


const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [showCreation, setShowCreation] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const { fetchRooms, deleteRoom, exportMeasurements  } = roomActions();

    useEffect(() => {
        loadRooms().catch(error => console.log(error));
    }, []);


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

    const handleExportMeasurements = async () => {
        try {
            await exportMeasurements();
            setSuccessMessage('Виміри успішно експортовано');
        } catch (error) {
            setError(`Не вдалося експортувати виміри: ${error}`);
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
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Кімнати</Typography>
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setShowCreation(true)}
                            sx={{ mr: 2 }}
                        >
                            Додати кімнату
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleExportMeasurements}
                        >
                            Експорт
                        </Button>
                    </Box>
                </Box>
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
            </Box>
    );
};

export default Rooms;