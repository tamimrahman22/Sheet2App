import { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, List, Stack, Button, Modal, InputLabel, Select, MenuItem, FormControl, OutlinedInput, Chip, Paper } from '@mui/material';
import TableView from '../components/tableView';
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
    const [optionOpen, setOptionOpen] = useState(false);
    // State to be updated about the view type the user wants to be added to the app 
    const [viewType, setViewType] = useState("Table");
    // State to store the data source object 
    const [dataSource, setDataSource] = useState("");

    // Get the key column of the data source
    const [keyColumnName, setKeyColumnName] = useState("");
    // Get the list of columns without the key column being in it!
    const [columnOptions, setColumnOptions] = useState([]);

    const [keyIndex, setKeyIndex] = useState("");

    // Store the column name of the columns the user wants to add to the view columns of the application 
    const [columnName, setColumnName] = useState([]);

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
        console.log('[VIEWS] Column Names are: ',columnName)
        // Data source is the object itself, pass the id to the function in order to generate the view + the view type the person specified 
        store.addView(dataSource._id, viewType, columnName);
        // Hide the modal 
        setOptionOpen(false);
    }

    function openOptionModal() {
        setKeyColumnName(dataSource.keys);
        setColumnOptions(dataSource.columns.filter((col) => (col.name !== keyColumnName)));
        setKeyIndex(dataSource.columns.findIndex((col) => col.name === keyColumnName));
        setOpen(false);
        setOptionOpen(true);
    }

    function closeOptionModal() {
        setOptionOpen(false);
        // Reset the state values
        setViewType("Table");
        setDataSource(null);
    }

    // Function to handle the change of the what was selected by the user
    const handleChange = (event) => {
        const selectedValues = event.target.value;
        const selectedColumns = selectedValues.map((value) => {
            const selectedColumn = dataSource.columns.find((col) => col.name === value);
            return { name: selectedColumn.name, index: dataSource.columns.indexOf(selectedColumn) };
        });
        console.log(selectedColumns)
        setColumnName(selectedColumns);
    };
      
    // Function to generate a detail table with the columns that the user specified 
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('[VIEW COLUMN] COLUMNS SELECTED WERE: ', columnName);
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
        height: 235,
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
                store.appViews.map((view) => {
                    if (store.userRole === "Developer" || view.roles.includes(store.userRole)) {
                        return (
                            <Box component="span" sx={{ p: 2 }} key={view._id}>
                                <TableView key={view._id} view={view} />
                            </Box>
                        )
                    }
                    else {
                        return (<Box />);
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
                        <InputLabel id="dataSource-select-label">Data Source</InputLabel>
                        <Select
                            labelId="dataSource-select-label"
                            id="dataSource-select"
                            value={dataSource}
                            label="Data Source"
                            onChange={(e) => setDataSource(e.target.value)}
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
                <Box m={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center" 
                    paddingTop={2}
                >
                    <Button variant="outlined" color="error" onClick={closeModal}>Cancel</Button>
                    <Button variant="contained" onClick={openOptionModal}>Add</Button>
                </Box>
            </Box>
        </Modal>

        <Modal
            open={optionOpen}
            onClose={closeOptionModal}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Box sx={{ width: "400", height:"300", overflow:"scroll" }} component={Paper} padding={5}>
                <Typography variant="h4" component="h2" textAlign="center" paddingBottom={2}>
                Select Columns to View
                </Typography>
                <FormControl sx={{ m: 1, width: 300 }} >
                    <InputLabel id="demo-multiple-chip-label">Select Columns:</InputLabel>
                        <Select
                        labelId="demo-multiple-chip-label"
                        id="demo-multiple-chip"
                        multiple
                        value={columnName.map((col) => col.name)}
                        onChange={handleChange}
                        input={<OutlinedInput id="select-multiple-chip" label="Select Columns" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.length > 0 &&
                                selected.map((value) => (
                                    <Chip key={value} label={value}/>
                                ))}
                            </Box>
                            )}
                        >
                            {
                                columnOptions.map((col, index) => (
                                    <MenuItem value={col.name} key={index}>{col.name}</MenuItem>
                                ))
                            }
                        </Select>
                </FormControl>
                <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <Button type="submit" variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} disabled={columnName.length === 1}>Submit</Button>
                </Box>
            </Box>
        </Modal>
        </>
    );
}