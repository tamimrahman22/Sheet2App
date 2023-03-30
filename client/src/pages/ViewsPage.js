import { useContext, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, List,  } from '@mui/material';
import TableView from '../components/tableView';
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';

export default function ViewsPage() {
    const auth = useContext(AuthContext);
    const store = useContext(GlobalContext);
    console.log(auth.user);
    console.log(store.currentApp);

    return (
        <>
        <Helmet>
            <title> S2A Views </title>
        </Helmet>

        <Container maxWidth="xl">
            <Typography variant="h4" >
                Views
            </Typography>
            <List sx={{ width: '100%' }}>
            {
                store.appViews.map((view) => (
                    <Box component="span" sx={{ p: 2 }} key={view._id}>
                        <TableView view={view} />
                    </Box>
                ))
            }
            </List>
        </Container>
        </>
    );
}