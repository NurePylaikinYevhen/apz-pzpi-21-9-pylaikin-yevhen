import React from 'react';
import { Box, Grid } from "@mui/material";

import { AccessibilityNew, TrendingUp, Nature } from '@mui/icons-material';
import FeatureCard from "./featureCard";

const FeaturesSection = () => (
    <Box mt={12}>
        <Grid container spacing={4}>
            <FeatureCard
                icon={<AccessibilityNew />}
                title="Покращення комфорту"
                description="Оптимізуйте робоче середовище для максимального комфорту співробітників"
            />
            <FeatureCard
                icon={<TrendingUp />}
                title="Збільшення продуктивності"
                description="Підвищіть ефективність роботи завдяки оптимальним умовам"
            />
            <FeatureCard
                icon={<Nature />}
                title="Екологічні рішення"
                description="Впроваджуйте екологічно чисті технології для сталого розвитку"
            />
        </Grid>
    </Box>
);

export default FeaturesSection;