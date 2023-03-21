// import { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Button, List, ListItem, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
// import Copyright from './Copyright'
// import AuthContext from '../auth'
// import GlobalStoreContext from '../store'

export default function WelcomeScreen() {
    // const { auth } = useContext(AuthContext);
    // const { store } = useContext(GlobalStoreContext);

    const handleGuest = (event) => {
        event.preventDefault();
        // auth.guestUser(store);
    }

    return (
        <div id="welcome-screen">
            <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40%',
            }}
            >
            <Paper 
                sx={{
                    p: 3,
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography component="h1" variant="h4">
                    Welcome to T<sup>5</sup>L
                </Typography>
                <Typography variant="body1">
                    A website where users can create, view, and rate Top 5 Lists of any topic around the world!
                </Typography>
                <List>
                    <ListItem>
                        <Button 
                        fullWidth
                        component={Link} to="/login"
                        variant="contained">
                            Login
                        </Button>
                    </ListItem>
                    <ListItem>
                        <Button 
                        fullWidth
                        variant="contained"
                        onClick={(event) => handleGuest(event)}>
                            Continue as Guest
                        </Button>
                    </ListItem>
                    <ListItem>
                        <Button 
                        fullWidth
                        component={Link} to="/register"
                        variant="contained">
                            Register
                        </Button>
                    </ListItem>
                </List>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
                    Poole Boys
                </Typography>
            </Paper>
            </Box>
        </div>
    );
}