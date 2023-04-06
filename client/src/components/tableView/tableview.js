import { useEffect, useState, useContext } from 'react';
import Paper from '@mui/material/Paper';
import { Typography, Card, CardContent, LinearProgress, Stack, Box, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, Collapse, Grid, TextField, Button, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import api from "../../api";
import GlobalContext from '../../components/context/GlobalContext';

function TableView(props) {
    const { view } = props;
    const store = useContext(GlobalContext);
    // console.log(view);
    const length = view.columns.length + 1
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [viewToEdit, setViewtoEdit] = useState(null);
    const [viewName, setViewName] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            let response = await api.getDataSourceById(view.table);
            console.log(response.data.url);
            let payload = {
                url: response.data.url,
                name: "Sheet1"  // DEFAULTING TO SHEET1
            }
            response = await api.getRows(payload);
            console.log(response.data);
            response.data.shift();
            setData(response.data);
            setLoading(false);
        }
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleChangeViewName() {
        console.log('[VIEWS] Handle name change of view!')
        console.log('[VIEWS] Original view name: ', view.name);
        console.log('[VIEWS] New view name: ', viewName);
        if (viewName.trim() !== '' && viewName !== view.name) {
            // Update the name of the data source
            store.renameView(viewName, view._id);
        }
        setEditMode(false);
    }

    function handleAddRecord() {
        console.log('[VIEWS] Handle adding new record to view');
        const inputs = [];
        for (let i = 0; i < length - 1; i++) {
            // console.log(document.getElementById("add-record-" + i).value);
            inputs.push(document.getElementById("add-record-" + i).value);
        }
        console.log(inputs);
        let temp = data;
        temp.push(inputs);
        setData(temp);
        console.log(data);
        store.addRecord(inputs, view.table);
    }

    function DetailedRow(props) {
        const { row, col } = props;
        const [open, setOpen] = useState(false);

        return (
            <>
                <TableRow onClick={() => {setOpen(!open)}}>
                    {
                        row.map(cell => {
                            return (
                                <TableCell>{cell}</TableCell>
                            )
                        })
                    }
                    <TableCell align="right"> {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={length}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Grid container spacing={1}>
                                    {
                                        col.map((c, index) => {
                                            return (
                                                <>
                                                    <Grid item xs={1} justifyContent="center" display="flex" alignItems="center">
                                                        <Typography variant="h6">
                                                            {c.name}:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={11}>
                                                        <TextField fullWidth id="textfield" variant="outlined" defaultValue={row[index]}/>
                                                    </Grid>
                                                </>
                                            )
                                        })
                                    }
                                    <Grid item xs={12} justifyContent="center" display="flex" alignItems="center">
                                        <Button variant="contained">Update Record</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </>
        )
    }

    function AddRecordRow(props) {
        const { col } = props;
        const [open, setOpen] = useState(false);
        
        return (
            <>
                <TableRow onClick={() => {setOpen(!open)}}>
                    <TableCell colSpan={length -1} align="center">Add Record</TableCell>
                    <TableCell align="right"> {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={length}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Grid container spacing={1}>
                                    {
                                        col.map((c, count) => {
                                            return (
                                                <>
                                                    <Grid item xs={1} justifyContent="center" display="flex" alignItems="center">
                                                        <Typography variant="h6">
                                                            {c.name}:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={11}>
                                                        <TextField fullWidth id={"add-record-" + count} variant="outlined"/>
                                                    </Grid>
                                                </>
                                            )
                                        })
                                    }
                                    <Grid item xs={12} justifyContent="center" display="flex" alignItems="center">
                                        <Button variant="contained" onClick={handleAddRecord}>Add Record</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </>
        )
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} >
                    <Box sx={{ minWidth: 240, flexGrow: 1 }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={12}
                            sx={{ px:1, mb: 2 }}
                        >
                            <Box display="flex" alignItems="center" sx = {{ gap: 3}}>
                                { editMode && view._id === viewToEdit._id ? 
                                    <TextField
                                    label = 'Enter a name for the view'
                                    variant='standard'
                                    value = {viewName}
                                    onChange={(e) => {
                                        setViewName(e.target.value)
                                    }}
                                    sx={{ width: "35%" }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleChangeViewName();
                                        }
                                    }}
                                    />
                                    :
                                    <Typography color="inherit" variant="h6" underline="hover" noWrap sx={{ pt: 1 }}>
                                        {view.name}
                                    </Typography>
                                }
                                {
                                    editMode && view._id === viewToEdit._id ? 
                                    <>
                                        <IconButton
                                            sx={{ bgcolor: 'green', color: 'white' }}
                                            disableRipple
                                            onClick={() => handleChangeViewName()}
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
                                    :
                                    <IconButton
                                        onClick={() => {
                                            setViewName(view.name);
                                            setViewtoEdit(view);
                                            setEditMode(true);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                }
                            </Box>
                            
                            {/* <Button variant="contained" onClick={handleAddRecord}>Add Record</Button> */}
                            <IconButton>
                                <DeleteIcon />
                            </IconButton>
                         </Stack>
                        
                        
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                {
                                    view.columns.map(c => {
                                        return (
                                            <TableCell>{c.name}</TableCell>
                                        )
                                    })
                                }
                                    <TableCell/>
                                </TableHead>
                                <TableBody>
                                { loading ? 
                                <TableCell colSpan={length}>
                                    <LinearProgress /> 
                                </TableCell> :
                                    data.map((row, index) => {
                                        return (
                                            <DetailedRow key={"row-" + index} row={row} col={view.columns}/>
                                        )
                                    }) 
                                }
                                <AddRecordRow col={view.columns} />
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {/*                       
                    <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
                        View Type: {view.viewType}
                    </Typography> */}
                            
                </Stack>
            </CardContent>
        </Card>
    )
}

export default TableView;