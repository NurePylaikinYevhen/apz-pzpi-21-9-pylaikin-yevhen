import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RoomCreationComponent from "../components/createRoom";

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [showCreation, setShowCreation] = useState(false);

    useEffect(() => {
        fetchRooms().catch(error => console.log('Помилка:', error));
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('/api/admin/rooms');
            setRooms(response.data);
        } catch (error) {
            console.error('Помилка при пошуку кімнат:', error);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await axios.delete(`/api/admin/rooms/${roomId}`);
            fetchRooms().catch(error => console.error('Помилка:', error));
        } catch (error) {
            console.error('Помилка при видаленні:', error);
        }
    };

    return (
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
                        onClose={() => {
                            setShowCreation(false);
                            fetchRooms();
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
        </Box>
    );
};

export default Rooms;