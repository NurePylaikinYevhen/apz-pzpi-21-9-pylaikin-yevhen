import React from 'react';
import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticsCard = ({ title, data }) => {
    const parameters = [
        { name: 'co2', label: 'CO2', color: '#8884d8' },
        { name: 'temperature', label: 'Температура', color: '#82ca9d' },
        { name: 'humidity', label: 'Вологість', color: '#ffc658' },
        { name: 'productivity', label: 'Продуктивність', color: '#ff7300' }
    ];

    const createBoxPlotData = (param) => {
        const stats = data[param.name];
        return [
            { name: 'Мін', value: stats.min },
            { name: 'Q1', value: stats.quartiles[0] },
            { name: 'Медіана', value: stats.quartiles[1] },
            { name: 'Q3', value: stats.quartiles[2] },
            { name: 'Макс', value: stats.max }
        ];
    };

    const createTimeSeriesData = () => {
        return data.time_stats.hourly_trends.temperature.map((temp, index) => ({
            hour: index,
            temperature: temp,
            humidity: data.time_stats.hourly_trends.humidity[index],
            co2: data.time_stats.hourly_trends.co2[index],
            productivity: data.time_stats.hourly_trends.productivity[index]
        }));
    };


    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Grid container spacing={2}>
                    {parameters.map((param, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Typography variant="subtitle1" gutterBottom>{param.label}</Typography>
                            <Box height={200}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={createBoxPlotData(param)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill={param.color} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>Часовий ряд</Typography>
                        <Box height={300}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={createTimeSeriesData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis yAxisId="temperature" />
                                    <YAxis yAxisId="humidity" orientation="right" />
                                    <YAxis yAxisId="co2" orientation="right" />
                                    <YAxis yAxisId="productivity" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="temperature" type="monotone" dataKey="temperature" stroke="#82ca9d" />
                                    <Line yAxisId="humidity" type="monotone" dataKey="humidity" stroke="#ffc658" />
                                    <Line yAxisId="co2" type="monotone" dataKey="co2" stroke="#8884d8" />
                                    <Line yAxisId="productivity" type="monotone" dataKey="productivity" stroke="#ff7300" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default StatisticsCard;