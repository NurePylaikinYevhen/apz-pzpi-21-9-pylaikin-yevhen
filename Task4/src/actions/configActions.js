import axios from 'axios';

export const configActions = () => {
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

    const updateDeviceConfig = async (deviceId, configData) => {
        try {
            const response = await axios.put(`/api/admin/config/${deviceId}`, configData);
            return response.data;
        } catch (error) {
            console.error('Помилка при оновленні конфігурації пристрою:', error);
            throw error;
        }
    };

    return {
        exportConfig,
        importConfig,
        updateDeviceConfig,
    };
};