import { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, List, Stack, Button, Modal, InputLabel, Select, MenuItem, FormControl} from '@mui/material';
import TableView from '../components/TableView';
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';

export default function ViewsPage() {
    const auth = useContext(AuthContext);
    const store = useContext(GlobalContext);
    console.log('[VIEWS] User is: ', auth.user);
    console.log('[VIEWS] Store is: ', store);
    console.log('[VIEWS] Current application is: ', store.currentApp);
    console.log('[VIEWS] Current application data source(s) are: ', store.appDataSource);

    // State to either show or hide the modal
    const [open, setOpen] = useState(false);
    // State to be updated about the view type the user wants to be added to the app 
    const [viewType, setViewType] = useState("Table");
    // State to store the data source object 
    const [dataSource, setDataSource] = useState(null);

    // Function to open the modal 
    function openModal(event) {
        console.log('[VIEWS] CURRENT App: ', store.currentApp)
        // Open the modal! 
        setOpen(true);
    }

    // Function to close the modal 
    function closeModal(event) {
        // Close the modal! 
        setOpen(false);
        // Reset the state values
        setViewType("Table");
        setDataSource(null);
    }

    // Function to handle when the add button is hit on the modal in order to process the view being made for the app
    function handleAddView(event) {
        console.log('[VIEWS] View Type: ', viewType)
        console.log('[VIEWS] Data Source Name is: ', dataSource)
        // Data source is the object itself, pass the id to the function in order to generate the view + the view type the person specified 
        store.addView(dataSource._id, viewType);
        // Hide the modal 
        setOpen(false);
    }

    // Style for the modal!
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        height: 330,
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: '10px',
    };

    return (
        <>
        <Helmet>
            <title> S2A Views </title>
        </Helmet>

        <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ px:6.5 }}
        >
            <Typography variant="h4" >
                Views
            </Typography>
            <Button variant="contained" onClick={openModal}>Add View</Button>
        </Stack>

        <Container maxWidth="xl">
            <List sx={{ width: '100%' }}>
            {
                store.appViews.map((view) => (
                    <Box component="span" sx={{ p: 2 }} key={view._id}>
                        <TableView key={view._id} view={view} />
                    </Box>
                ))
            }
            </List>
        </Container>

        <Modal
            open={open}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx = {style} justifyContent="center" alignItems="center">
                <Box>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Add View
                    </Typography>
                </Box>
                <Box paddingTop={1}>
                    <FormControl sx={{ minWidth: 350 }}>
                        <InputLabel id="viewType-select-label">View Type</InputLabel>
                        <Select
                            labelId="viewType-select-label"
                            id="viewType-select"
                            value={viewType}
                            label="Age"
                            onChange={(e) => setViewType(e.target.value)}
                        >
                            <MenuItem value={"Table"}>Table</MenuItem>
                            <MenuItem value={"Detail"}>Detail</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box paddingTop={2}>
                    <FormControl sx={{ minWidth: 350}}>
                        <InputLabel id="dataSource-select-label">Data Source</InputLabel>
                        <Select
                            labelId="dataSource-select-label"
                            id="dataSource-select"
                            value={dataSource}
                            label="Age"
                            onChange={(e) => setDataSource(e.target.value)}
                        >
                            {
                                store.appDataSource.map(ds => {
                                    return (
                                        <MenuItem key={ds} value={ds}>{ds.dataSourceName}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                </Box>
                <Box m={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center" 
                    paddingTop={2}
                >
                    <Button variant="outlined" color="error" onClick={closeModal}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddView}>Add</Button>
                </Box>
            </Box>
        </Modal>
        </>
    );
}