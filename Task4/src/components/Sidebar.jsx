import {Box, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography} from "@mui/material";
import Devices from "../Devices/Devices";
import Rooms from "../Rooms/Rooms";
import Person from "../Person/Person";
import {useAuth} from "../AuthContext";
import {Link} from "react-router-dom";

const drawerWidth = 240;

const SidebarNavigation = () => {
    const { username } = useAuth();

    return (
        <Box sx={{ width: 240, bgcolor: '#1976D2', color: 'white', height: '100vh', position: 'fixed' }}>
            <List>
                <ListItem>
                    <ListItemText primary={`Аккаунт: ${username}`} />
                </ListItem>
                <ListItem>
                    <Button component={Link} to="/admin/account" variant="text" fullWidth sx={{ justifyContent: 'flex-start', color: 'white' }}>
                        Аккаунт
                    </Button>
                </ListItem>
                <ListItem>
                    <Button component={Link} to="/admin/rooms" variant="text" fullWidth sx={{ justifyContent: 'flex-start', color: 'white' }}>
                        Кімнати
                    </Button>
                </ListItem>
                <ListItem>
                    <Button component={Link} to="/admin/devices" variant="text" fullWidth sx={{ justifyContent: 'flex-start', color: 'white' }}>
                        Пристрої
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
};

export default SidebarNavigation;