import {Box, Grid, Paper, styled, Typography} from "@mui/material";
import { motion } from 'framer-motion';


const StyledCard = styled(Paper)(({ theme }) => ({
    height: 350,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[10],
    },
    position: 'relative',
    zIndex: 1,
    flexGrow: 1,
    minWidth: 200,
    maxWidth: 400,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: '100%',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
}));


const FeatureCard = ({ icon, title, description }) => (
    <Grid item xs={12} sm={6} md={4}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <StyledCard elevation={3}>
                <IconWrapper>{icon}</IconWrapper>
                <Typography variant="h6" align="center" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" align="center" color="textSecondary">
                    {description}
                </Typography>
            </StyledCard>
        </motion.div>
    </Grid>
);

export default FeatureCard;