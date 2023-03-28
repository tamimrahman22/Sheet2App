// import { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
// import Copyright from './Copyright'
// import AuthContext from '../auth'
// import GlobalStoreContext from '../store'

export default function ViewsPage() {
    // const { auth } = useContext(AuthContext);
    // const { store } = useContext(GlobalStoreContext);

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
                    Views
                </Typography>
            </Paper>
            </Box>
        </div>
    );
}