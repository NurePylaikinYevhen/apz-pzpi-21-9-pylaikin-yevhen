import React, { useState } from 'react';
import {
    Box,
    Container,
    styled,
    useMediaQuery,
    useTheme,
    Grid, Typography, alpha, CircularProgress
} from "@mui/material";
import Header from "../components/header";
import FeaturesSection from "../components/feature";
import LoginModal from "../components/LoginModal";
import AppBarComponent from "../components/AppBar";
import EnvironmentImage from "../img/office.svg";
import RoomCreationComponent from "../components/createRoom";
import CustomAppBar from "../components/AppBar";
import {useAuth} from "../AuthContext";



const GradientBackground = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    padding: theme.spacing(6, 4),
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(12, 6),
    },
    width: '100%',
    maxWidth: '1500px'
}));



const ImageContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));


const StyledImage = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
});

const TextContent = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    paddingRight: theme.spacing(20),
}));


const LandingPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const { login, loading } = useAuth();

    const handleOpenLoginModal = () => setOpenLoginModal(true);
    const handleCloseLoginModal = () => setOpenLoginModal(false);

    const handleLoginSuccess = async (username, password) => {
        const success = await login(username, password);
        if (success) {
            handleCloseLoginModal();
        }
    };

    const handleOpenAdminPanel = () => {
        console.log('Opening admin panel');
        // Тут в майбутньому додам логіку відкриття адмін-панелі
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <GradientBackground>
            <CustomAppBar
                handleOpenLoginModal={handleOpenLoginModal}
                handleOpenAdminPanel={handleOpenAdminPanel}
            />
            <ContentContainer maxWidth="lg">
                <TextContent>
                    <Header />
                    <Box mt={4}>
                        <FeaturesSection />
                    </Box>
                </TextContent>
                {!isMobile && (
                    <ImageContainer>
                        <StyledImage src={EnvironmentImage} alt="Eco-friendly workspace" />
                    </ImageContainer>
                )}
            </ContentContainer>
            {openLoginModal && (
                <LoginModal
                    onLoginSuccess={handleLoginSuccess}
                    onClose={handleCloseLoginModal}
                />
            )}
        </GradientBackground>
    );
};

export default LandingPage;
