import { useEffect, useState, useContext, Fragment } from 'react';
import Paper from '@mui/material/Paper';
import { Typography, Card, CardContent, LinearProgress, Stack, Box, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, Collapse, Grid, TextField, Button, IconButton, Modal, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
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
    const [url, setUrl] = useState("");
    const length = view.columns.length + 1
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [viewToEdit, setViewtoEdit] = useState(null);
    const [viewName, setViewName] = useState(null);
    const [open, setOpen] = useState(false);
    const selectedColumns = view.columns.columnName;

    console.log("COLUMN NAMES ARE: ",selectedColumns);


    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        height: 200,
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: '10px'
      };
  

    useEffect(() => {
        async function fetchData() {
            let url = ""
            setLoading(true);
            let response = await api.getDataSourceById(view.table);
            url = response.data.url;
            setUrl(url);
            console.log(url);

            if (!sessionStorage.getItem(url)) {
                let payload = {
                    url: response.data.url,
                    name: "Sheet1"  // DEFAULTING TO SHEET1``
                }
                response = await api.getRows(payload);
                console.log(response.data);
                response.data.shift();
                setData(response.data);
                
                window.sessionStorage.setItem(url, JSON.stringify(response.data));
                console.log("SHEET DATA ADDED TO SESSION STORAGE");
            }
            else {
                setData(JSON.parse(sessionStorage.getItem(url)));
                console.log("SHEET DATA RETRIEVED FROM SESSION STORAGE");
            }
            setLoading(false);
        }
        fetchData();
    }, [view.table, view.updatedAt]);

    
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
            inputs.push(document.getElementById("add-record-value-" + i).value);
        }
        console.log(inputs);
        let temp = data;
        temp.push(inputs);
        setData(temp);
        console.log(data);
        window.sessionStorage.setItem(url, JSON.stringify(temp));
        store.addRecord(inputs, view.table);
    }

    function handleDeleteView() {
        console.log(view._id);
        closeModal();
        store.deleteView(view._id);
    }

    function openModal(event) {
        // Close the modal! 
        console.log(view._id);
        setOpen(true)
    }

    function closeModal(event) {
        // Close the modal! 
        setOpen(false)
    }

    function handleSelect(event) {
        const {
            target: { value },
        } = event;
        console.log(value);
        store.setViewRoles(view._id, value);
    }

    function DetailedRow(props) {
        const { row, col, tableId } = props;
        const [open, setOpen] = useState(false);

        function handleDeleteRecord(event) {
            event.stopPropagation();
            console.log(row);
            console.log(tableId);
            store.deleteRecord(row, tableId);
            let temp = data.filter(r => !row.includes(r[0]));
            setData(temp);
            window.sessionStorage.setItem(url, JSON.stringify(temp));
        }

        return (
            <>
                {data.map((row, rowIndex) => (
                    <TableRow key={`row-${rowIndex}`} onClick={() => {setOpen(!open)}}>
                        {view.columns.columnName.map((column) => {
                            const { name, index } = column;
                            return index >= 0 && index < row.length ?
                                <TableCell key={`cell-${rowIndex}-${index}`}>{row[index]}</TableCell> :
                                null
                        })}
                        <TableCell align="right" sx={{ verticalAlign: 'top' }}> 
                            <IconButton onClick={handleDeleteRecord}>
                                <DeleteIcon fontSize='small'/>
                            </IconButton>
                            {open ? 
                            <IconButton onClick={() => {setOpen(!open)}} >
                                <KeyboardArrowUpIcon />
                            </IconButton>
                            : 
                            <IconButton onClick={() => {setOpen(!open)}} >
                                <KeyboardArrowDownIcon />
                            </IconButton>
                            } 
                        </TableCell>
                    </TableRow>
                ))}

                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={length}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Grid container spacing={1}>
                                    {
                                        col.map((c, index) => {
                                            return (
                                                <Fragment key={"update-record-" + index}>
                                                    <Grid item xs={1} justifyContent="center" display="flex" alignItems="center">
                                                        <Typography variant="h6">
                                                            {c.name}:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={11}>
                                                        <TextField fullWidth id="textfield" variant="outlined" defaultValue={row[index]}/>
                                                    </Grid>
                                                </Fragment>
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
                                        col.map((c, index) => {
                                            return (
                                                <Fragment key={"add-record-" + index}>
                                                    <Grid item xs={1} justifyContent="center" display="flex" alignItems="center">
                                                        <Typography variant="h6">
                                                            {c.name}:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={11}>
                                                        <TextField fullWidth id={"add-record-value-" + index} variant="outlined"/>
                                                    </Grid>
                                                </Fragment>
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

    // function ViewColumn(props) {
    //     // // Destructure the 'col' props from the 'props' object
    //     // const { col } = props
    //     // // Destructure the 'view' props from the 'props' object
    //     // const { view } = props;

    //     // //Import the global state of our application
    //     // const store = useContext(GlobalContext);

    //     // // Get the data source that is used to build the view 
    //     // const viewDataSouce = store.appDataSources.find((ds) => (ds._id === view.table))
    //     // // Get the key column of the data source
    //     // const keyColumnName = viewDataSouce.keys
    //     // // Get the list of columns without the key column being in it!
    //     // const columnOptions = col.filter((col) => (col.name !== keyColumnName))

    //     // const keyIndex = col.findIndex((col) => col.name === keyColumnName);

    
    //     // DEBUG CONSOLE STATEMENTS TO SEE WHAT VARIABLES ARE RETURNING!
    //     console.log('[VIEW COLUMN] DATA SOURCE IS : ', viewDataSouce)
    //     console.log('[VIEW COLUMN] COL IS: ', col);
    //     console.log('[VIEW COLUMN] VIEW IS: ', view);
    //     console.log('[VIEW COLUMN] OPTIONS ARE: ', columnOptions)

    //     // // Store the column name of the columns the user wants to add to the view columns of the application 
    //     // const [columnName, setColumnName] = useState([{name: keyColumnName, index: keyIndex}]);
    //     // State to manage the opening and closing of the modal
    //     const [open, setOpen] = useState(false)

    //    // Function to handle the change of the what was selected by the user
    //     const handleChange = (event) => {
    //         const selectedValues = event.target.value;
    //         const selectedColumns = selectedValues.map((value) => {
    //             const selectedColumn = col.find((col) => col.name === value);
    //             return { name: selectedColumn.name, index: col.indexOf(selectedColumn) };
    //         });
    //         console.log(selectedColumns)
    //         setColumnName(selectedColumns);
    //     };
          
    //     // Function to generate a detail table with the columns that the user specified 
    //     const handleSubmit = (event) => {
    //         event.preventDefault();
    //         console.log('[VIEW COLUMN] COLUMNS SELECTED WERE: ', columnName);
    //         // TODO: Add code to open a modal and generate the table the user specified by the column name!
    //         setOpen(true)
    //     };

    //     function closeModal(){
    //         setOpen(false)
    //     }
        
    //     return (
    //         <>
    //             <TableRow>
    //                 <TableCell colSpan={length -1} align="center">
    //                     <FormControl sx={{ m: 1, width: 300 }}>
    //                         <InputLabel id="demo-multiple-chip-label">Select Columns:</InputLabel>
    //                             <Select
    //                             labelId="demo-multiple-chip-label"
    //                             id="demo-multiple-chip"
    //                             multiple
    //                             value={columnName.map((col) => col.name)}
    //                             onChange={handleChange}
    //                             input={<OutlinedInput id="select-multiple-chip" label="Select Columns" />}
    //                             renderValue={(selected) => (
    //                                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
    //                                   {selected.length > 0 &&
    //                                     selected.map((value) => (
    //                                       <Chip key={value} label={value}/>
    //                                     ))}
    //                                 </Box>
    //                               )}
    //                             >
    //                                 {
    //                                     columnOptions.map((col, index) => (
    //                                         <MenuItem value={col.name} key={index}>{col.name}</MenuItem>
    //                                     ))
    //                                 }
    //                             </Select>
    //                     </FormControl>
    //                     <Button type="submit" variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} disabled={columnName.length === 1}>Submit</Button>
    //                 </TableCell>
    //             </TableRow>
                
    //             <Modal
    //                 open={open}
    //                 onClose={closeModal}
    //                 sx={{
    //                     display: 'flex',
    //                     justifyContent: 'center',
    //                     alignItems: 'center'
    //                 }}
    //             >
    //                 <Box sx={{ width: "75%", height:"75%", overflow:"scroll" }} component={Paper} padding={5}>
    //                     <Typography variant="h4" component="h2">
    //                     Selected Columns
    //                     </Typography>
    //                     <TableContainer component={Paper}>
    //                         <Table aria-label="simple table">
    //                             <TableHead>
    //                                 <TableRow>
    //                                     {columnName.map((col, index) => (<TableCell key={"column-" + index}>{col.name}</TableCell>))}
    //                                 </TableRow>
    //                             </TableHead>
    //                             <TableBody>
    //                             {data.map((row, rowIndex) => (
    //                                 <TableRow key={`row-${rowIndex}`}>
    //                                     {columnName.map((column) => {
    //                                         const { name, index } = column;
    //                                         return index >= 0 && index < row.length ?
    //                                             <TableCell key={`cell-${rowIndex}-${index}`}>{row[index]}</TableCell> :
    //                                             null
    //                                     })}
    //                                 </TableRow>
    //                             ))}
    //                             </TableBody>
    //                         </Table>
    //                     </TableContainer>
    //                     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems:'center'}} component={Paper} paddingTop={2}>
    //                         <Button variant="contained" onClick={closeModal}>
    //                             Close
    //                         </Button>
    //                     </Box>
    //                 </Box>
    //             </Modal>
    //         </>
    //     )
    // }

    return (
        <>
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
                                        // sx={{ width: "35%" }}
                                        fullWidth
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
                                                // sx={{ bgcolor: 'green', color: 'white' }}
                                                color='success'
                                                onClick={() => handleChangeViewName()}
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
                                <Box display="flex" alignItems="center">
                                    <InputLabel id="demo-multiple-chip-label">Roles</InputLabel>
                                    <FormControl sx={{ m: 1, width: 500 }}>
                                        <Select
                                        labelId="demo-multiple-chip-label"
                                        id="demo-multiple-chip"
                                        multiple
                                        value={view.roles}
                                        onChange={handleSelect}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                            ))}
                                            </Box>
                                        )}
                                        >
                                            {
                                                store.currentApp.roles.map(role => {
                                                    if (role.name !== "Developer") {
                                                        return (
                                                            <MenuItem key={role.name} value={role.name}>
                                                                {role.name}
                                                            </MenuItem>
                                                        )
                                                    }
                                                    return <Box/>                                               
                                                })
                                            }
                                        </Select>
                                    </FormControl> 
                                    <IconButton onClick={openModal} sx={{ verticalAlign: 'top' }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Stack>
                            
                            
                            <TableContainer component={Paper}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            {view.columns.columnName.map((col, index) => (<TableCell key={"column-" + index}>{col.name}</TableCell>))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    { loading ? 
                                    <TableRow>
                                        <TableCell colSpan={length}>
                                            <LinearProgress /> 
                                        </TableCell>
                                    </TableRow> :
                                        data.map((row, index) => {
                                            return (
                                                <DetailedRow key={"detail-row-" + index} row={row} col={view.columns} tableId={view.table} />
                                            )
                                        }) 
                                    }
                                    <AddRecordRow key={'add-record-' + view._id} col={view.columns} />
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
            <Modal
                open={open}
                onClose={closeModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx = {style} justifyContent="center" alignItems="center">
                    <Box>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            Are you sure you want to delete the view: <br/> {view.name}?
                        </Typography>
                    </Box>
                    <Box m={1}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center" 
                        paddingTop={2}
                    >
                        <Button variant="outlined" onClick={closeModal}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteView}>Delete</Button>
                    </Box>
                </Box>
            </Modal>
        </>
    )
}

export default TableView;