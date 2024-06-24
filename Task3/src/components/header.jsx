import { motion } from 'framer-motion';
import {Box, Typography} from "@mui/material";


const Header = () => (
    <Box component={motion.div}
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8 }}
    >
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" color="black">
            Вітаємо
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="black">
            Налаштуйте середовище для кращої продуктивності
        </Typography>
    </Box>
);

export default Header;