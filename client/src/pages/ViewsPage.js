import { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, List, Stack, Button, Modal, InputLabel, Select, MenuItem, FormControl, Chip } from '@mui/material';
import TableView from '../components/TableView';
import DeveloperView from '../components/DeveloperView';
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';

export default function ViewsPage() {
    const auth = useContext(AuthContext);
    const store = useContext(GlobalContext);
    console.log('[VIEWS] User is: ', auth.user);
    console.log('[VIEWS] Store is: ', store);
    console.log('[VIEWS] Current application is: ', store.currentApp);
    console.log('[VIEWS] Current application data source(s) are: ', store.appDataSources);

    
    // State to either show or hide the modal
    const [open, setOpen] = useState(false);
    // State to be updated about the view type the user wants to be added to the app 
    const [viewType, setViewType] = useState("");
    // State to store new view data source object 
    const [dataSource, setDataSource] = useState(null);
    // Store the column name of the columns the user wants to add to the view columns of the application 
    const [columns, setColumns] = useState([]);
    // State to store the new view allowed actions
    const [actions, setActions] = useState([]);
    // State to store the new view roles
    const [roles, setRoles] = useState([]);
    // Defining actions
    const tableActions = ["Add Record", "Delete Record"];
    const detailActions = ["Edit Record"];
    // Get the list of columns without the key column being in it!
    const [columnOptions, setColumnOptions] = useState([]);

    // Function to open the modal 
    function openModal(event) {
        console.log('[VIEWS] CURRENT App: ', store.currentApp)
        // Open the modal! 
        setOpen(true);
        // setColumnOptions([]);
    }

    // Function to close the modal 
    function closeModal(event) {
        // Close the modal! 
        setOpen(false);
        // Reset the state values
        setViewType("");
        setDataSource(null);
        setColumns([]);
        setActions([]);
        setRoles([]);
    }

    // Function to handle when the add button is hit on the modal in order to process the view being made for the app
    function handleAddView(event) {
        // console.log('[VIEWS] View Type: ', viewType)
        console.log('[VIEWS] Data Source Name is: ', dataSource)
        // console.log('[VIEWS] Column Names are: ', columns)
        // Data source is the object itself, pass the id to the function in order to generate the view + the view type the person specified 
        store.addView(dataSource._id, viewType, columns, actions, roles);
        // Hide the modal 
        closeModal();
    }

    const handleDataSourceChange = (event) => {
        setDataSource(event.target.value);
        console.log("DATA SOURCE IS: ",event.target.value);
        const cols = event.target.value.columns.map((col) => col['name']);
        setColumnOptions(cols);
        setColumns(cols);
    }

    // Function to handle the change of the what was selected by the user
    const handleChange = (event) => {
        const selectedValues = event.target.value;
        setColumns(selectedValues);
    };
      
    // Function to generate a detail table with the columns that the user specified 
    const handleSubmit = (event) => {
        event.preventDefault();
        // console.log('[VIEW COLUMN] COLUMNS SELECTED WERE: ', columns);
        // TODO: Add code to open a modal and generate the table the user specified by the column name!
        handleAddView();
    };


    // Style for the modal!
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 415,
        height: 530,
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: '10px',
        // overflow:"scroll"
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
            { store.userRole === "Developer" && <Button variant="contained" onClick={openModal}>Add View</Button> }
        </Stack>

        <Container maxWidth="xl">
            <List sx={{ width: '100%' }}>
            {
                store.appViews.map((view) => {
                    if (store.userRole === "Developer") {
                        return (
                            <Box component="span" sx={{ p: 2 }} key={view._id}>
                                <DeveloperView key={view._id} view={view} />
                            </Box>
                        )
                    }
                    else if (view.roles.includes(store.userRole) && view.viewType !== "Detail") {
                        return (
                            <Box component="span" sx={{ p: 2 }} key={view._id}>
                                <TableView key={view._id} view={view} />
                            </Box>
                        )
                    }
                    else {
                        return null;
                    }
                })
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
                <Box paddingTop={2}>
                    <FormControl sx={{ minWidth: 350}}>
                        <InputLabel id="table-type-select-label">Table Type</InputLabel>
                        <Select
                            labelId="table-type-select-label"
                            id="table-type-select"
                            value={viewType}
                            label="Table Type"
                            onChange={(e) => setViewType(e.target.value)}
                        >
                            <MenuItem key={"table"} value={"Table"}>Table</MenuItem>
                            <MenuItem key={"detail"} value={"Detail"}>Detail</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box paddingTop={2}>
                    <FormControl sx={{ minWidth: 350}}>
                        <InputLabel id="dataSource-select-label">Data Source</InputLabel>
                        <Select
                            labelId="dataSource-select-label"
                            id="dataSource-select"
                            value={dataSource || ""}
                            label="Data Source"
                            onChange={handleDataSourceChange}
                        >
                            {
                                store.appDataSources.map(ds => {
                                    return (
                                        <MenuItem key={ds._id} value={ds}>{ds.dataSourceName}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                </Box>
                <Box paddingTop={2}>
                    <FormControl sx={{ minWidth: 350}} disabled={viewType === "" || dataSource === null}>
                        <InputLabel id="columns-chip-label">{viewType === "Detail" ? "Editable Columns" : "Columns"}</InputLabel>
                        <Select
                        labelId="columns-chip-label"
                        label={viewType === "Detail" ? "Editable Columns" : "Columns"}
                        id="columns-chip"
                        multiple
                        value={columns}
                        onChange={handleChange}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.length > 0 &&
                                selected.map((value) => (
                                    <Chip key={value} label={value}/>
                                ))}
                            </Box>
                            )}
                        overflow="scroll"
                        >
                            {
                                columnOptions.map((col, index) => (
                                    <MenuItem value={col} key={index}>{col}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Box>
                <Box paddingTop={2}>
                    <FormControl sx={{ minWidth: 350}} disabled={viewType === "" || dataSource === null}>
                        <InputLabel id="roles-select-label">Roles</InputLabel>
                        <Select
                            labelId="roles-select-label"
                            id="roles-select"
                            multiple
                            value={roles}
                            label="Roles"
                            onChange={(e) => setRoles(e.target.value)}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                <Chip key={value} label={value} />
                                ))}
                                </Box>
                            )}
                        >
                            {
                                store.currentApp.roles.map(r => {
                                    if (r.name === "Developer") {
                                        return null;
                                    }
                                    return (
                                        <MenuItem key={r.name} value={r.name}>{r.name}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                </Box>
                <Box paddingTop={2}>
                    <FormControl sx={{ minWidth: 350}} disabled={viewType === "" || dataSource === null}>
                        <InputLabel id="allowedActions-select-label">Allowed Actions</InputLabel>
                        <Select
                            labelId="allowedActions-select-label"
                            id="allowedActions-select"
                            multiple
                            value={actions}
                            label="Allowed Actions"
                            onChange={(e) => setActions(e.target.value)}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                <Chip key={value} label={value} />
                                ))}
                                </Box>
                            )}
                        >
                            {
                                viewType === "Table" ?
                                tableActions.map(a => {
                                    return (
                                        <MenuItem key={a} value={a}>{a}</MenuItem>
                                    )
                                })
                                :
                                detailActions.map(a => {
                                    return (
                                        <MenuItem key={a} value={a}>{a}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                </Box>
                <Box paddingTop={2}>
                    <Box m={1}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center" 
                    >
                        <Button variant="outlined" color="error" onClick={closeModal}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={viewType === "" || dataSource === null}>Add</Button>
                    </Box>
                </Box>
            </Box>
        </Modal>

        
        </>
    );
}