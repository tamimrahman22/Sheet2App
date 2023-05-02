// import { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Button, Typography, Link, Modal, TextField, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Stack, IconButton, FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';
import { useContext, useState, useEffect } from 'react';

export default function DataSource() {
    // Import the auth context of S2A 
    const auth = useContext(AuthContext);
    // Import the gobal state of S2A 
    const store = useContext(GlobalContext);

    // Create a mapping of the ID of the data sources with the name of the key column of each data source! 
    const dsToKeyName = store.appDataSources.map(item => ({ _id: item._id, keys: item.keys }));
    console.log(dsToKeyName)

    // CONSOLE DEBUG STATEMENTS TO SEEE WHAT FIELDS ARE RETURNING
    console.log('[DATA SOURCE] USER IS: ', auth.user);
    console.log('[DATA SOURCE] STORE IS: ', store);
    console.log('[DATA SOURCE] CURRENT App: ', store.currentApp)
    console.log('[DATA SOURCE] CURRENT App Data Source: ', store.appDataSources)

    // State that opens and shows the modal to create an application 
    const [open, setOpen] = useState(false)
    // State that opens and shows the modal to delete a data source 
    const [showDelete, setShowDelete] = useState(false);
    // State that takes the user input for the spreadsheet url 
    const [spreadsheetURL, setSpreadSheetURL] = useState();
    // State that takes the user input for index of the sheet they want to be added as a data source
    const [index, setIndex] = useState();
    // State that takes the user input for the name of the data source that they want to be made
    const [dsName, setDsName] = useState();
    // State that allows the user to change the name of the data source
    const [editMode, setEditMode] = useState(false);
    // State that stores the change named of the data source being modified
    const [dataSourceName, setDataSourceName] = useState('');
    // State that stores the original name of the data source 
    const [originalDataSourceName, setOriginalDataSourceName] = useState('')
    // State that store the data source that is being modified 
    const [dataSource, setDataSource] = useState({})


    useEffect(() => {
        window.sessionStorage.clear();
    })
    
    function openModal() {
        console.log('[DATA SOURCE] CURRENT App: ', store.currentApp)
        // Open the modal! 
        setOpen(true);
    }

    function closeModal() {
        // Close the modal! 
        setOpen(false);
        setShowDelete(false);
    }

    const handleKeySelect = (e, ds) => {
        // Grab the select value from the user 
        const selectedValue = e.target.value;
        // The data source that we are modifying the key column for 
        const dataSource = ds
        
        // Update the state of the current data source
        setDataSource(ds)

        console.log('[DATA SOURCE] Data source is: ', ds)
        console.log('[DATA SOURCE| The specified key column is: ', selectedValue)
        
        //Update the key column of the data source 
        store.setKeys(selectedValue, dataSource)
    }

    function handleChangeDataSourceName(){
        console.log('[DATA SOURCE] Handle name change of data source!')
        console.log('[DATA SOURCE] Original data source name: ', originalDataSourceName);
        console.log('[DATA SOURCE] New data source name: ', dataSourceName);
        // The user has made changes to the name
        if (dataSourceName.trim() !== '' && dataSourceName !== originalDataSourceName) {
            // Update the name of the data source
            store.renameDataSource(dataSourceName, dataSource);
        }
        // Stop editing the name of the data source
        setEditMode(false)
    }

    // Function to handle setting the initial value of a column
    function handleInitialValueChange(dsID, colID, value){
        // dsID --> the ID of the data source we are going to update the initial Value for a specified column for
        // colID --> the ID of the column in the data source that we are going to update the initial value
        // value --> the intial value of that the customer specified 
        store.updateInitialValue(dsID, colID, value); 
    } 

    // Function to handle a change in the value of the label 
    function handleLabelChange(dsID, colID, value){ 
        // dsID --> the ID of the data source we are going to update the the column's value of label for 
        // colID --> the ID of the column in the specified DS that we're gonna update the boolean value to 
        // value --> yes == true and no == false
        store.updateLabel(dsID, colID, value);
    }

    function handleDataSourceReferenceChange(dsID, colID, dsRefValue){
        // dsID --> the ID of the data source we are going to update that specified column's dataSourceReference value to
        // colID --> the ID of column with the data source that we're going to update the dataSourceReference value to
        // dsRefValue --> the ID of the data source we are referencing 
        if (dsRefValue === "None") {
            dsRefValue = null;
        }
        store.updateDataSourceReference(dsID, colID, dsRefValue);
    }
    
    function handleColumnReferenceChange(dsID, colID, colRefValue){
        // dsID --> the ID of the data source we are going to update that specified column's columnReference value to
        // colID --> the ID of column with the data source that we're going to update the columnReference value to
        // colRefValue --> the ID of the column of the data source we are referencing
        if (colRefValue === "None") {
            colRefValue = null;
        }
        store.updateColumnReference(dsID, colID, colRefValue)
    }
    

    function handleAddDataSource(){
        console.log('[DATA SOURCE] CURRENT APP: ', store.currentApp._id)
        console.log('[DATA SOURCE] Name of Data Source: ', dsName)
        console.log('[DATA SOURCE] Spreadsheet: ', spreadsheetURL)
        console.log('[DATA SOURCE] Sheet Index: ', index)
        // Pass this infomration to our store to create the data source! 
        store.addDataSource(store.currentApp._id, dsName, spreadsheetURL, index, '')
        // Close the modal! 
        setOpen(false)
    }

    function handleDeleteDataSource() {
        console.log(dataSource);
        setShowDelete(false);
        store.deleteDataSource(dataSource._id);
    }

    // Style for the modal!
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: '10px'
    };

    // Style for the delete modal!
    const deleteStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: '10px'
    };

    return (
        <>
        <Helmet>
            <title> S2A Data Sources </title>
        </Helmet>

        <Stack
        direction="row"
        justifyContent="space-between"
        spacing={12}
        sx={{ px:1 }}
        >
            <Typography variant="h4" >
                Data Sources
            </Typography>
            <Button variant="contained" onClick={openModal}>Add Data Source</Button>
        </Stack>
        {
            store.appDataSources.map(ds => (
                <Box key={ds._id} paddingTop={3}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={12}
                        sx={{ px:1, mb: 2 }}
                    >
                        <Box
                            display="flex" 
                            alignItems="center"
                            sx = {{
                                gap: 3
                            }}
                        >
                            {editMode && ds._id === dataSource._id  ? 
                            (
                                <TextField
                                    label = 'Enter a name for the data source'
                                    variant='standard'
                                    value = {dataSourceName}
                                    onChange={(e) => {
                                        setDataSourceName(e.target.value)
                                    }}
                                    fullWidth
                                    // sx={{ width: "50%" }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleChangeDataSourceName();
                                        }
                                    }}
                                />
                            ) 
                                : 
                            (
                                <Typography variant="h4">{ds.dataSourceName}</Typography>
                            )
                            }
                                {
                                    editMode && ds._id === dataSource._id ? 
                                    (
                                        <>
                                            <IconButton
                                                // sx={{ bgcolor: 'green', color: 'white' }}
                                                color='success'
                                                onClick={() => handleChangeDataSourceName()}
                                            >
                                                <DoneIcon></DoneIcon>
                                            </IconButton>

                                            <IconButton
                                                // sx={{ bgcolor: 'red', color: 'white'}}
                                                color='error'
                                                onClick={() => setEditMode(false)}
                                            >
                                                <ClearIcon></ClearIcon>
                                            </IconButton>
                                        </>
                                    ) 
                                        : 
                                    (
                                        <IconButton
                                            onClick={() => {
                                                setOriginalDataSourceName(ds.dataSourceName)
                                                setDataSourceName(ds.dataSourceName)
                                                setDataSource(ds)
                                                setEditMode(true)
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    )
                                }
                        </Box>
                        <IconButton onClick={() => {
                            setDataSource(ds);
                            setShowDelete(true)}}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                    <TableContainer component={Paper} style={{ overflow: 'auto', height: '50vh' }}>   
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Spreadsheet Name</TableCell>
                                    <TableCell>Sheet Name</TableCell>
                                    <TableCell>URL of Spreadsheet</TableCell>
                                    <TableCell>Sheet Index</TableCell>
                                    <TableCell>Column Info</TableCell>
                                    <TableCell>Keys</TableCell>
                                </TableRow>
                            </TableHead>
                            {
                                store.appDataSources.length > 0 ? 
                                <TableBody>
                                    <TableRow padding={2} key={ds._id}>
                                        <TableCell>{ds.spreadSheetName}</TableCell>
                                        <TableCell>{ds.sheetName}</TableCell>
                                        <TableCell><Link href={ds.url} target="_blank">{ds.url}</Link></TableCell>
                                        <TableCell>{ds.sheetIndex + 1}</TableCell>
                                        <TableCell>
                                            <TableContainer 
                                                style={{ overflow: 'auto', height: '35vh', width: '40vw'}}
                                            >
                                                <Table size="small">
                                                    <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Type</TableCell>
                                                        <TableCell>Initial Value</TableCell>
                                                        <TableCell>Label?</TableCell>
                                                        <TableCell>Reference</TableCell>
                                                        <TableCell>Reference Column</TableCell>
                                                    </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                    {ds.columns.map((col) => (
                                                        <TableRow key={col._id.$oid}>
                                                            <TableCell>{col.name}</TableCell>
                                                            <TableCell>{col.type.charAt(0).toUpperCase() + col.type.slice(1)}</TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    defaultValue={col.initialValue ? col.initialValue : ''}
                                                                    style={{width: '150px'}}
                                                                    inputProps={{ style: { textAlign: 'center' } }}
                                                                    onBlur={(e) => handleInitialValueChange(ds._id, col._id, e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormControl
                                                                    // FORM CONTROL FOR SAYING THAT THIS COLUMN WILL BE LINKED TO ANOTHER COLUMN OF ANOTHER DATA SOURCE
                                                                    style={{width: '85px'}}
                                                                    disabled={store.appDataSources.length == 1}
                                                                >
                                                                    <InputLabel>
                                                                        Label?
                                                                    </InputLabel>
                                                                    <Select
                                                                        value={col.label}
                                                                        label="Label?"
                                                                        onChange={(e) => handleLabelChange(ds._id, col._id, e.target.value)}
                                                                    >
                                                                        <MenuItem value={false}>No</MenuItem>
                                                                        <MenuItem value={true}>Yes</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormControl
                                                                    style={{ width: "150px" }}
                                                                    disabled={ds.length <= 1}
                                                                >
                                                                    <InputLabel>Data Source?</InputLabel>
                                                                    <Select
                                                                    value={col.dataSourceReference || "None"}
                                                                    label="Data Source?"
                                                                    onChange={(e) =>
                                                                        handleDataSourceReferenceChange(
                                                                        ds._id,
                                                                        col._id,
                                                                        e.target.value
                                                                        )
                                                                    }
                                                                    >
                                                                    <MenuItem value="None">None</MenuItem>
                                                                    {store.appDataSources
                                                                        .filter((d) => d._id !== ds._id)
                                                                        .map((d) => (
                                                                        <MenuItem key={d._id} value={d._id}>
                                                                            {d.dataSourceName}
                                                                        </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                                </TableCell>
                                                                <TableCell>
                                                                <FormControl
                                                                    style={{ width: "150px" }}
                                                                    disabled={!col.dataSourceReference}
                                                                >
                                                                    <InputLabel>Column?</InputLabel>
                                                                    <Select
                                                                    label="Column?"
                                                                    value={col.columnReference || "None"}
                                                                    onChange={(e) => {
                                                                        handleColumnReferenceChange(ds._id, col._id, e.target.value);
                                                                    }}
                                                                    >
                                                                    <MenuItem value="None">None</MenuItem>
                                                                    {store.appDataSources
                                                                        .find((ds) => ds._id === col.dataSourceReference)
                                                                        ?.columns?.map((column) => (
                                                                        <MenuItem key={column._id} value={column._id}>
                                                                            {column.name}
                                                                        </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </TableCell>
                                        <TableCell>
                                            <FormControl sx={{ minWidth: 250 }}>
                                                <InputLabel id="key-column-label">Key Column</InputLabel>
                                                    <Select
                                                        labelId="key-column-label"
                                                        value={(dsToKeyName.find(obj => obj._id === ds._id)).keys || ''}
                                                        label="Key Column"
                                                        onChange={(e) => handleKeySelect(e, ds)}
                                                    >
                                                        {ds.columns.map((col) => (
                                                        <MenuItem key={col.name} value={col.name}>{col.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                </TableBody> 
                                            : 
                                <Typography padding={2} fontWeight='bold' color='red' fontStyle='italic'>Uh-oh! No data sources were added to the app!</Typography>
                            }
                        </Table>
                    </TableContainer>
                </Box>
            ))
        }

        <Modal
            open={open}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx = {style} justifyContent="center" alignItems="center">
                <Box>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Add Data Source 
                    </Typography>
                </Box>
                <Box paddingTop={1}>
                    <TextField fullWidth id="standard-basic" label="Data Source Name" variant="standard" onChange={(e) => setDsName(e.target.value)}/>
                </Box>
                <Box paddingTop={1}>
                    <TextField fullWidth id="standard-basic" label="Spreadsheet URL" variant="standard" onChange={(e) => setSpreadSheetURL(e.target.value)}/>
                </Box>
                <Box paddingTop={2}>
                    <TextField fullWidth id="standard-basic" label="Sheet Index" variant="standard" onChange={(e) => setIndex(e.target.value)}/>
                </Box>
                <Box m={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center" 
                    paddingTop={3}
                >
                    <Button variant="outlined" color="error" onClick={closeModal}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddDataSource}>Add</Button>
                </Box>
            </Box>
        </Modal>

        <Modal
            open={showDelete}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
                <Box sx = {deleteStyle} width={450} justifyContent="center" alignItems="center">
                    <Box>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            Are you sure you want to delete the data source <i>{dataSource.dataSourceName}</i>?
                        </Typography>
                        <Typography id="modal-modal-subtitle" variant="subtitle1" component="h2" paddingTop={2}>
                            This will delete any views using it.
                        </Typography>
                    </Box>
                    <Box m={1}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center" 
                        paddingTop={3}
                    >
                        <Button variant="outlined" onClick={closeModal}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteDataSource}>Delete</Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}