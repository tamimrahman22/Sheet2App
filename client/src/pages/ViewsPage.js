// import { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Container, Typography } from '@mui/material';
// import Copyright from './Copyright'
// import AuthContext from '../auth'
// import GlobalStoreContext from '../store'

export default function ViewsPage() {
    // const { auth } = useContext(AuthContext);
    // const { store } = useContext(GlobalStoreContext);

    return (
        <>
        <Helmet>
            <title> S2A Views </title>
        </Helmet>

        <Container maxWidth="xl">
            <Typography variant="h4" >
                Views
            </Typography>
            
        </Container>
        </>
    );
}