import { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, List, Stack, Button, Modal, InputLabel, Select, MenuItem} from '@mui/material';
import TableView from '../components/tableView';
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';

export default function ViewsPage() {
    const auth = useContext(AuthContext);
    const store = useContext(GlobalContext);
    console.log(auth.user);
    console.log(store.currentApp);

    const [open, setOpen] = useState(false);
    const [viewType, setViewType] = useState("Table");
    const [dataSource, setDataSource] = useState(null);

    function openModal(event) {
        console.log('[VIEWS] CURRENT App: ', store.currentApp)
        // Open the modal! 
        setOpen(true);
    }

    function handleClose(event) {
        // Close the modal! 
        setOpen(false);
        setViewType("Table");
        setDataSource(null);
    }

    function handleAddView(event) {
        console.log(viewType);
        console.log(dataSource);
        store.addView(dataSource, viewType);
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
        // alignItems: "center",
        // textAlign: "center",
        // justifyContent: "center"
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
            {/* <Typography variant="h4" >
                Views
            </Typography> */}
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

        <Modal
            open={open}
            onClose={handleClose}
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
                </Box>
                <Box paddingTop={2}>
                    <InputLabel id="dataSource-select-label">View Type</InputLabel>
                    <Select
                        labelId="dataSource-select-label"
                        id="dataSource-select"
                        value={dataSource}
                        label="Age"
                        onChange={(e) => setDataSource(e.target.value)}
                    >
                        {
                            store.currentApp.dataSources.map(ds => {
                                return (
                                    <MenuItem value={ds}>{ds}</MenuItem>
                                )
                            })
                        }
                    </Select>
                </Box>
                <Box m={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center" 
                    paddingTop={2}
                >
                    <Button variant="outlined" color="error" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddView}>Add</Button>
                </Box>
            </Box>
        </Modal>
        </>
    );
}