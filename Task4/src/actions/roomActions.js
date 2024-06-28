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

    const getAllStatistics = async (timeFrom, timeTo) => {
        try {
            const response = await axios.post('/api/analytics/statistics/all', {
                time_from: timeFrom.toISOString(),
                time_to: timeTo.toISOString()
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const getRoomStatistics = async (roomId, timeFrom, timeTo) => {
        try {
            const response = await axios.post('/api/analytics/statistics/room', {
                room_id: roomId,
                time_from: timeFrom.toISOString(),
                time_to: timeTo.toISOString()
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const exportMeasurements = async () => {
        try {
            const response = await axios.get('/api/admin/measurements/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'measurements.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            throw error;
        }
    };

    return {
        fetchRooms,
        deleteRoom,
        createRoom,
        fetchRoomDetails,
        fetchRoomDevices,
        getAllStatistics,
        getRoomStatistics,
        exportMeasurements
    };
};