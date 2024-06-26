import axios from 'axios';

export const roomActions = () => {
    const fetchRooms = async () => {
        try {
            const response = await axios.get('/api/admin/rooms');
            return response.data;
        } catch (error) {
            console.error('Помилка при пошуку кімнат:', error);
            throw error;
        }
    };

    const deleteRoom = async (roomId) => {
        try {
            await axios.delete(`/api/admin/rooms/${roomId}`);
        } catch (error) {
            console.error('Помилка при видаленні:', error);
            throw error;
        }
    };

    const createRoom = async (roomData) => {
        try {
            const formattedData = {
                name: roomData.name,
                device_macs: roomData.devices.map(device => device.macAddress)
            };
            const response = await axios.post('/api/admin/rooms', formattedData);
            return response.data;
        } catch (error) {
            console.error('Помилка при створенні кімнати:', error);
            throw error;
        }
    };

    const fetchRoomDetails = async (roomId) => {
        try {
            const response = await axios.get(`/api/admin/rooms/${roomId}`);
            return response.data;
        } catch (error) {
            console.error('Помилка при отриманні деталей кімнати:', error);
            throw error;
        }
    };

    const fetchRoomDevices = async (roomId) => {
        try {
            const response = await axios.get(`/api/admin/rooms/${roomId}/devices`);
            return response.data;
        } catch (error) {
            console.error('Помилка при отриманні пристроїв кімнати:', error);
            throw error;
        }
    };

    const updateRoomDetails = async (roomId, roomData) => {
        try {
            const response = await axios.put(`/api/admin/rooms/${roomId}`, roomData);
            return response.data;
        } catch (error) {
            console.error('Помилка при оновленні деталей кімнати:', error);
            throw error;
        }
    };

    const exportConfig = async (deviceId = null) => {
        try {
            const url = deviceId
                ? `/api/admin/config/export?device_id=${deviceId}`
                : '/api/admin/config/export';
            const response = await axios.get(url, { responseType: 'blob' });
            return response.data;
        } catch (error) {
            console.error('Помилка при експорті конфігурації:', error);
            throw error;
        }
    };

    const importConfig = async (file, deviceId = null) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const url = deviceId
                ? `/api/admin/config/import?device_id=${deviceId}`
                : '/api/admin/config/import';
            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Помилка при імпорті конфігурації:', error);
            throw error;
        }
    };

    return {
        fetchRooms,
        deleteRoom,
        createRoom,
        fetchRoomDetails,
        fetchRoomDevices,
        updateRoomDetails,
        exportConfig,
        importConfig
    };
};