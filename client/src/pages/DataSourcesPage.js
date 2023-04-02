// import { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Button, Typography, Link, Modal, TextField, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Stack, IconButton, FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
// import Copyright from './Copyright'
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';
import { useContext, useState } from 'react';

export default function DataSource() {
    const auth = useContext(AuthContext);
    const store = useContext(GlobalContext);
    // console.log('[DATA SOURCE] USER IS: ', auth.user);
    // console.log('[DATA SOURCE] STORE IS: ', store);
    // console.log('[DATA SOURCE] CURRENT App: ', store.currentApp)
    // console.log('[DATA SOURCE] CURRENT App Data Source: ', store.appDataSource)

    // State that opens and shows the modal 
    const [open, setOpen] = useState(false)
    // State that takes the user input for the spreadsheet url 
    const [spreadsheetURL, setSpreadSheetURL] = useState();
    // State that takes the user input for index of the sheet they want to be added as a data source
    const [index, setIndex] = useState();
    // State that allows the user to change the name of the data source
    const [editMode, setEditMode] = useState(false);
    // State that stores the change named of the data source being modified
    const [dataSourceName, setDataSourceName] = useState('');
    // State that stores the original name of the data source 
    const [originalDataSourceName, setOriginalDataSourceName] = useState('')
    // State that store the data source that is being modified 
    const [dataSource, setDataSource] = useState({})
    // State that stored the key column for the data source!
    const [keyColumn, setKeyColumn] = useState('');

    function openModal(event) {
        console.log('[DATA SOURCE] CURRENT App: ', store.currentApp)
        // Open the modal! 
        setOpen(true);
    }

    function closeModal(event) {
        // Close the modal! 
        setOpen(false)
    }

    const handleKeySelect = (e, ds) => {
        // Grab the select value from the user 
        const selectedValue = e.target.value;
        // The data source that we are modifying the key column for 
        const dataSource = ds
        
        // Update the state of the key column
        setKeyColumn(selectedValue)
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

    function handleAddDataSource(event){
        console.log('[DATA SOURCE] CURRENT APP: ', store.currentApp._id)
        console.log('[DATA SOURCE] Spreadsheet: ', spreadsheetURL)
        console.log('[DATA SOURCE] Sheet Index: ', index)
        // Pass this infomration to our store to create the data source! 
        store.addDataSource(store.currentApp._id, spreadsheetURL, index, '')
        // Close the modal! 
        setOpen(false)
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
            store.appDataSource.map(ds => (
                <Box key={ds._id} paddingTop={3}>
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
                                sx={{ width: "35%" }}
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
                                            sx={{ bgcolor: 'green', color: 'white' }}
                                            disableRipple
                                            onClick={() => handleChangeDataSourceName()}
                                        >
                                            <DoneIcon></DoneIcon>
                                        </IconButton>

                                        <IconButton
                                            sx={{ bgcolor: 'red', color: 'white'}}
                                            disableRipple
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
                    <TableContainer component={Paper}>   
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableCell>Spreadsheet Name</TableCell>
                                <TableCell>Sheet Name</TableCell>
                                <TableCell>URL of Spreadsheet</TableCell>
                                <TableCell>Sheet Index</TableCell>
                                <TableCell>Column Name(s)</TableCell>
                                <TableCell>Keys</TableCell>
                            </TableHead>
                            {
                                store.appDataSource.length > 0 ? 
                                <TableBody>
                                    <TableRow padding={2} key={ds._id}>
                                        <TableCell>{ds.spreadSheetName}</TableCell>
                                        <TableCell>{ds.sheetName}</TableCell>
                                        <TableCell><Link href={ds.url} target="_blank">{ds.url}</Link></TableCell>
                                        <TableCell>{ds.sheetIndex + 1}</TableCell>
                                        <TableCell>{ds.columns.map(col => col.name).join(", ")}</TableCell>
                                        <TableCell>
                                            <FormControl sx={{ minWidth: 250 }}>
                                                <InputLabel id="key-column-label">Key Column</InputLabel>
                                                    <Select
                                                        labelId="key-column-label"
                                                        value = {ds.keys}
                                                        onChange={(e) => handleKeySelect(e, ds)}
                                                    >
                                                        {ds.columns.map((col) => (
                                                        <MenuItem value={col.name}>{col.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                </TableBody> 
                                            : 
                                <Typography padding={2} fontWeight='bold' color='red' fontStyle='ita7c'>Uh-oh! No data sources were added to the app!</Typography>
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
                    <TextField fullWidth id="standard-basic" label="Spreadsheet URL" variant="standard" onChange={(e) => setSpreadSheetURL(e.target.value)}/>
                </Box>
                <Box paddingTop={2}>
                    <TextField fullWidth id="standard-basic" label="Sheet Index" variant="standard" onChange={(e) => setIndex(e.target.value)}/>
                </Box>
                <Box m={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center" 
                    paddingTop={2}
                >
                    <Button variant="outlined" color="error" onClick={closeModal}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddDataSource}>Add</Button>
                </Box>
            </Box>
        </Modal>
        </>
    );
}