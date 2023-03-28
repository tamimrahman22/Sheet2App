// import { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
// import Copyright from './Copyright'
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';
import { useContext } from 'react';

export default function WelcomeScreen() {
    const { auth } = useContext(AuthContext);
    const store = useContext(GlobalContext);
    console.log(store.currentAppID);

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
                    Data Sources
                </Typography>
            </Paper>
            </Box>
        </div>
    );
}