import React from 'react';
import {Card, CardContent, Grid, Typography} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticsCard = ({ title, data }) => {
    const parameters = [
        { name: 'CO2', color: '#8884d8' },
        { name: 'Температура', color: '#82ca9d' },
        { name: 'Вологість', color: '#ffc658' },
        { name: 'Продуктивність', color: '#ff7300' }
    ];

    const chartData = parameters.map(param => ({
        name: param.name,
        Середнє: data[`avg_${param.name.toLowerCase()}`],
        Медіана: data[`median_${param.name.toLowerCase()}`],
        Відхилення: data[`${param.name.toLowerCase()}_deviation`]
    }));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Grid container spacing={2}>
                    {parameters.map((param, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Typography variant="subtitle1" gutterBottom>{param.name}</Typography>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={[chartData[index]]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Середнє" fill={param.color} />
                                    <Bar dataKey="Медіана" fill={`${param.color}99`} />
                                    <Bar dataKey="Відхилення" fill={`${param.color}66`} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default StatisticsCard;