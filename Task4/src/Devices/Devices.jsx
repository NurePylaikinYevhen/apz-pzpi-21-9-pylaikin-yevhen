import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newDeviceMac, setNewDeviceMac] = useState('');

    const handleAddDevice = async () => {
        try {
            await axios.post('/api/admin/devices', { mac_address: newDeviceMac });
            setOpenDialog(false);
            setNewDeviceMac('');
        } catch (error) {
            console.error('Помилка при додаванні:', error);
        }
    };

    const handleDeleteDevice = async (macAddress) => {
        try {
            await axios.delete(`/api/admin/devices/${macAddress}`);
        } catch (error) {
            console.error('Помилка при видаленні:', error);
        }
    };

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
                            secondary={`Room ID: ${device.room_id || 'Not assigned'}`}
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