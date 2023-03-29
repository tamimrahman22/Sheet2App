// import { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { Button, Container, Typography, Drawer, Modal, TextField, TableContainer, Table, TableHead, TableBody, TableRow, TableCell} from '@mui/material';
// import Copyright from './Copyright'
import AuthContext from '../components/context/AuthContext';
import GlobalContext from '../components/context/GlobalContext';
import { useContext, useState } from 'react';

export default function DataSource() {
    const auth = useContext(AuthContext);
    const store = useContext(GlobalContext);
    console.log('[DATA SOURCE] USER IS: ', auth.user);
    console.log('[DATA SOURCE] STORE IS: ', store);
    console.log('[DATA SOURCE] CURRENT App: ', store.currentApp)
    console.log('[DATA SOURCE] CURRENT App Data Source: ', store.currentAppDataSource)

    store.currentAppDataSource.map(ds =>{
        const row = (
        <TableRow key={ds._id}>
            <TableCell>{ds.name}</TableCell>
            <TableCell>{ds.url}</TableCell>
            <TableCell>{ds.sheetIndex + 1}</TableCell>
            <TableCell>HELLO!</TableCell>
        </TableRow>)
    })
    //states for the component
    const [open, setOpen] = useState(false)
    const [spreadsheetURL, setSpreadSheetURL] = useState();
    const [index, setIndex] = useState();
    const [keys, setKeys] = useState([]);    

    function openModal(event) {
        console.log('[DATA SOURCE] CURRENT App: ', store.currentApp)
        // Open the modal! 
        setOpen(true);
    }

    function handleClose(event) {
        // Close the modal! 
        setOpen(false)
    }

    function handleAddDataSource(event){
        console.log('[DATA SOURCE] CURRENT APP: ', store.currentApp._id)
        console.log('[DATA SOURCE] Spreadsheet: ', spreadsheetURL)
        console.log('[DATA SOURCE] Sheet Index: ', index)
        console.log('[DATA SOURCE] Keys: ', keys)
        // Pass this infomration to our store to create the data source! 
        store.createDataSource(store.currentApp._id, spreadsheetURL, index, keys)
        // Close the modal! 
        setOpen(false)
    }

    // Style for the modal!
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        height: 330,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: '20px',
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center"
      };


    // Sheets that they added for the data source
    // Name of the columns within the data source! 
    // URL of the sheet for the data sources
    // Sheet Name 
    
    // have the option to delete the data source {OPTIONAL! }

    return (
        <>
        <Helmet>
            <title> S2A Data Sources </title>
        </Helmet>

        <Container maxWidth="xl">
            <Typography variant="h4" >
            Data Sources
            </Typography>
            <Button variant="contained" onClick= {openModal}>Add Data Source</Button>
        </Container>

        <Box>
            <TableContainer
                    component={Paper}
                >   
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableCell>Sheet Name</TableCell>
                            <TableCell>URL of Spreadsheet</TableCell>
                            <TableCell>Sheet Index</TableCell>
                            <TableCell>Column Name(s)</TableCell>
                        </TableHead>
                        <TableBody>
                        {   
                            store.currentAppDataSource.length > 0 ? 
                            store.currentAppDataSource.map(ds => {
                                return (
                                    <TableRow key={ds._id}>
                                        <TableCell>{ds.name}</TableCell>
                                        <TableCell>{ds.url}</TableCell>
                                        <TableCell>{ds.sheetIndex + 1}</TableCell>
                                        <TableCell>{ds.columns.map(col => col.name).join(", ")}</TableCell>
                                    </TableRow>
                                );
                            }) : <Typography>NO DATA SOURCES ADDED TO APP!</Typography>
                        }
                        </TableBody>
                    </Table>
                </TableContainer>
        </Box>

        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx = {style} justifyContent="center" alignItems="center">
                <Box>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    Add Data Source 
                    </Typography>
                </Box>
                <Box paddingTop={2}>
                    <TextField id="standard-basic" label="Spreadsheet URL" variant="standard" onChange={(e) => setSpreadSheetURL(e.target.value)}/>
                </Box>
                <Box paddingTop={2}>
                    <TextField id="standard-basic" label="Sheet Index" variant="standard" onChange={(e) => setIndex(e.target.value)}/>
                </Box>
                <Box paddingTop={2}>
                    <TextField id="standard-basic" label="Keys" variant="standard" onChange={(e) => setKeys(e.target.value)}/>
                </Box>
                <Box paddingTop={2}>
                    <Button variant="contained" onClick={handleAddDataSource}>Add</Button>
                </Box>
            </Box>
        </Modal>
        </>
    );
}