import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import {deviceActions} from "../actions/deviceActions";

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newDeviceMac, setNewDeviceMac] = useState('');
    const [error, setError] = useState(null);
    const { fetchDevices, addDevice, deleteDevice } = deviceActions();

    useEffect(() => {
        handleFetchDevices().catch(error => console.log(error));
    }, []);

    const handleAddDevice = async () => {
        try {
            await addDevice(newDeviceMac);
            await handleFetchDevices();
            setNewDeviceMac('');
            setOpenDialog(false);
        } catch (error) {
            setError(`Не вдалося додати пристрій: ${error}`);
            console.error('Помилка при додаванні:', error);
        }
    };

    const handleDeleteDevice = async (macAddress) => {
        try {
            await deleteDevice(macAddress);
            setDevices(devices.filter(device => device.mac_address !== macAddress))
        } catch (error) {
            setError(`Не вдалося видалити пристрій: ${error}`);
            console.error('Помилка при видаленні:', error);
        }
    };

    const handleFetchDevices = async () => {
        try {
            const fetchedDevices = await fetchDevices();
            setDevices(fetchedDevices);
        } catch (error) {
            setError(`Не вдалося отримати пристрої: ${error}`);
            console.error('Помилка при отриманні:', error);
        }
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Пристрої</Typography>
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ mb: 3 }}
            >
                Додати пристрій
            </Button>
            <List>
                {devices.map((device) => (
                    <ListItem key={device.mac_address}>
                        <ListItemText
                            primary={`MAC: ${device.mac_address}`}
                            secondary={`Room ID: ${device.room_id || 'Поки що не призначено кімнату'}`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDevice(device.mac_address)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Додати новий пристрій</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="MAC-адреса"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newDeviceMac}
                        onChange={(e) => setNewDeviceMac(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Скасувати</Button>
                    <Button onClick={handleAddDevice} variant="contained" color="primary">Додати</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Devices;