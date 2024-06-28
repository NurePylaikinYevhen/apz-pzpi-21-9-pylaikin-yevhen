import axios from 'axios';


export const deviceActions = () => {

    const addDevice = async (macAddress) => {
        try {
            const response = await axios.post('/api/admin/devices', { mac_address: macAddress });
            return response.data;
        } catch (error) {
            console.error('Помилка при додаванні пристрою:', error);
            throw error;
        }
    };

    const fetchDevices = async () => {
        try {
            const response = await axios.get('/api/admin/devices');
            return response.data;
        } catch (error) {
            console.error('Помилка при пошуку пристроїв:', error);
            throw error;
        }
    };

    const deleteDevice = async (deviceId) => {
        try {
            await axios.delete(`/api/admin/devices/${deviceId}`);
        } catch (error) {
            console.error('Помилка при видаленні пристрою:', error);
            throw error;
        }
    };

    const createDevice = async (deviceData) => {
        try {
            const response = await axios.post('/api/admin/devices', deviceData);
            return response.data;
        } catch (error) {
            console.error('Помилка при створенні пристрою:', error);
            throw error;
        }
    };


    return {
        fetchDevices,
        deleteDevice,
        createDevice,
        addDevice
    };
}