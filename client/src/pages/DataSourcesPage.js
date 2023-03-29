// import { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Button, Container, Typography } from '@mui/material';
// import Copyright from './Copyright'
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';
import { useContext } from 'react';

export default function WelcomeScreen() {
    const auth = useContext(AuthContext);
    const store = useContext(GlobalContext);
    console.log(auth.user);
    console.log(store.currentApp);

    return (
        <>
        <Helmet>
            <title> S2A Data Sources </title>
        </Helmet>

        <Container maxWidth="xl">
            <Typography variant="h4" >
            Data Sources
            </Typography>
            <Button variant="contained">Add Data Source</Button>
            
        </Container>
        </>
    );
}