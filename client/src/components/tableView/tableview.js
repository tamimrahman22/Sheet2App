import { useEffect, useState, useContext, Fragment } from 'react';
import { useSnackbar } from 'notistack';
import Paper from '@mui/material/Paper';
import { Typography, Card, CardContent, LinearProgress, Stack, Box, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, Collapse, Grid, TextField, Button, IconButton, } from '@mui/material';
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
    const { enqueueSnackbar } = useSnackbar();
    // console.log(view);
    const [url, setUrl] = useState("");
    const length = view.columns.length + 1
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [tableColumns, setTableColumns] = useState([]);
    const [detailView, setDetailView] = useState(null);

    useEffect(() => {
        async function fetchData() {
            let url = ""
            setLoading(true);
            let response = await api.getDataSourceById(view.table);
            url = response.data.url;
            setUrl(url);
            setTableColumns(response.data.columns)
            console.log(url);

            if (!sessionStorage.getItem(url)) {
                let payload = {
                    url: response.data.url,
                    name: "Sheet1"  // DEFAULTING TO SHEET1``
                }
                response = await api.getRows(payload);
                console.log(response.data);
                window.sessionStorage.setItem(url, JSON.stringify(response.data));
                setColumns(response.data.shift());
                setData(response.data);
            
                console.log("SHEET DATA ADDED TO SESSION STORAGE");
            }
            else {
                const cache = JSON.parse(sessionStorage.getItem(url));
                console.log(cache);
                setColumns(cache.shift());
                setData(cache);
                console.log("SHEET DATA RETRIEVED FROM SESSION STORAGE");
            }
            setLoading(false);
        }
        fetchData();
    }, [store.appViews, store.userRole, view.table, view.updatedAt]);

    useEffect(() => {
        for (let i = 0; i < store.appViews.length; i++) {
            let v = store.appViews[i]
            if (v.viewType === "Detail" && v.table === view.table && v.roles.includes(store.userRole)) {
                setDetailView(v);
                break;
            }
        }
    }, [store.appViews, store.userRole, view.table])

    function checkInputs(inputs) {
        let check = true;
        let urlRegex = /^(http|https):\/\/[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
        for(let i = 0; i < tableColumns.length; i++){
            // console.log(columns[i]);
            console.log(typeof inputs[i]);
            if(!isNaN(inputs[i])){
                if(tableColumns[i].type !== 'number'){
                    check = false;
                }
            }
            else if(typeof inputs[i] === 'boolean' || inputs[i] === 'FALSE' || inputs[i] === 'TRUE' || inputs[i] === 'false' || inputs[i] === 'true'){
                if(tableColumns[i].type !== 'boolean'){
                    check = false;
                }
            }
            else if(urlRegex.test(inputs[i])) {
                if(tableColumns[i].type !== 'url'){
                    check = false;
                }
            }
            else if(tableColumns[i].type !== 'string'){
                check = false;
            }
        }
        return check;
    }

    function Row(props) {
        const { row, tableId, viewId } = props;

        const indices = [];
        view.columns.forEach(c => indices.push(columns.indexOf(c)));
        // console.log(indices);
        
        function handleDeleteRecord(event) {
            event.stopPropagation();
            console.log(row);
            console.log(tableId);
            store.deleteRecord(row, viewId, tableId);
            let temp = data.filter(r => !row.includes(r[0]));
            setData(temp);
            temp.unshift(columns);
            window.sessionStorage.setItem(url, JSON.stringify(temp));
        }

        return (
            <>
                <TableRow>
                {
                    row.map((cell, index) => {
                        if (indices.includes(index)) {
                            return (
                                <TableCell key={"cell-value-" + cell}>{cell}</TableCell>
                            )
                        }
                        return null;
                    })
                }
                    <TableCell align="right" sx={{ verticalAlign: 'top' }}> 
                        { view.allowedActions.includes("Delete Record") && 
                        <IconButton onClick={handleDeleteRecord}>
                            <DeleteIcon fontSize='small'/>
                        </IconButton> }
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={length}/>
                </TableRow>
            </>
        );
    }

    function DetailedRow(props) {
        const { row, tableId, viewId } = props;
        const [open, setOpen] = useState(false);
        const [edit, setEdit] = useState(false);

        const indices = [];
        view.columns.forEach(c => indices.push(columns.indexOf(c)));
        // console.log(indices);

        function handleDeleteRecord(event) {
            event.stopPropagation();
            console.log(row);
            console.log(tableId);
            store.deleteRecord(row, viewId, tableId);
            let temp = data.filter(r => !row.includes(r[0]));
            setData(temp);
            temp.unshift(columns);
            window.sessionStorage.setItem(url, JSON.stringify(temp));
        }

        function handleEditRecord(event) {
            console.log('[VIEWS] Handle editing a record');
            const inputs = [];
            for (let i = 0; i < columns.length; i++) {
                inputs.push(document.getElementById("edit-record-value-" + i).value);
            }
            console.log(row);
            console.log(inputs);
            if (checkInputs(inputs)) {
                // Check if inputs are valid
                let temp = data;
                temp[temp.indexOf(row)] = inputs
                setData(temp);
                temp.unshift(columns);
                console.log(temp);
                window.sessionStorage.setItem(url, JSON.stringify(temp));
                store.editRecord(row, inputs, view.table);
                setEdit(false);
            }
            else {
                // If not, display Snackbar
                enqueueSnackbar("Record cannot be edited. Check your inputs and try again.", { variant: 'error' });
            }
            
        }

        return (
            <>
                <TableRow onClick={() => {setOpen(!open)}}>
                    {
                        row.map((cell, index) => {
                            if (indices.includes(index)) {
                                return (
                                    <TableCell key={"cell-value-" + cell}>{cell}</TableCell>
                                )
                            }
                            return null;
                        })
                    }
                    <TableCell align="right" sx={{ verticalAlign: 'top' }}> 
                        { view.allowedActions.includes("Delete Record") && 
                        <IconButton onClick={handleDeleteRecord}>
                            <DeleteIcon fontSize='small'/>
                        </IconButton> }
                        {open ? 
                        <IconButton disableRipple onClick={() => {setOpen(!open)}} >
                            <KeyboardArrowUpIcon />
                        </IconButton>
                        : 
                        <IconButton disableRipple onClick={() => {setOpen(!open)}} >
                            <KeyboardArrowDownIcon />
                        </IconButton>
                        } 
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={length}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Grid container spacing={1}>
                                    {
                                        columns.map((c, index) => {
                                            return (
                                                <Fragment key={"update-record-" + index}>
                                                    <Grid item xs={1} justifyContent="center" display="flex" alignItems="center">
                                                        <Typography variant="h6">
                                                            {c}:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={11}>
                                                        <TextField fullWidth id={"edit-record-value-" + index} variant="outlined" disabled={!detailView.editable.includes(c)} InputProps={{ readOnly: !edit }} defaultValue={row[index]}/>
                                                    </Grid>
                                                </Fragment>
                                            )
                                        })
                                    }
                                    { detailView.allowedActions.includes("Edit Record") && 
                                    <Grid item xs={12} justifyContent="center" display="flex" alignItems="center">
                                        {
                                            edit 
                                            ?
                                            <>
                                                <IconButton
                                                    // sx={{ bgcolor: 'green', color: 'white' }}
                                                    color='success'
                                                    onClick={handleEditRecord}
                                                >
                                                    <DoneIcon></DoneIcon>
                                                </IconButton>

                                                <IconButton
                                                    // sx={{ bgcolor: 'red', color: 'white'}}
                                                    color='error'
                                                    onClick={() => setEdit(false)}
                                                >
                                                    <ClearIcon></ClearIcon>
                                                </IconButton>
                                            </>
                                            :
                                            <IconButton
                                                onClick={() => setEdit(true)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        }
                                    </Grid> }
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

        function handleAddRecord() {
            console.log('[VIEWS] Handle adding new record to view');
            const inputs = [];
            for (let i = 0; i < columns.length; i++) {
                // console.log(document.getElementById("add-record-" + i).value);
                inputs.push(document.getElementById("add-record-value-" + i).value);
            }
            console.log(inputs);
            if (checkInputs(inputs)) {
                // Check if inputs are valid
                let temp = data;
                temp.push(inputs);
                setData(temp);
                console.log(data);
                temp.unshift(columns);
                window.sessionStorage.setItem(url, JSON.stringify(temp));
                store.addRecord(inputs, view.table);
            }
            else {
                // If not, display Snackbar
                enqueueSnackbar("Record cannot be added. Check your inputs and try again.", { variant: 'error' });
            }
        }
        
        return (
            <>
                <TableRow onClick={() => {setOpen(!open)}}>
                    <TableCell colSpan={length -1} align="center">Add Record</TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'top' }}> {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} </TableCell>
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
                                                            {c}:
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

    return (
        <>
            <Card>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} >
                        <Box sx={{ minWidth: 240, flexGrow: 1 }}>
                            <Typography color="inherit" variant="h6" underline="hover" noWrap sx={{ px:1, mb: 2 }}>
                                {view.name}
                            </Typography>
                            
                            
                            <TableContainer component={Paper}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            {
                                                view.columns.map((c, index) => {
                                                    console.log(c);
                                                    return (
                                                        <TableCell key={"column-" + index}>{c}</TableCell>
                                                    )
                                                })
                                            }
                                            <TableCell/>
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
                                                detailView ? 
                                                <DetailedRow key={"detail-row-" + index} row={row} tableId={view.table} viewId={view._id}/>
                                                :
                                                <Row key={"detail-row-" + index} row={row} tableId={view.table} viewId={view._id} />
                                            )
                                        }) 
                                    }
                                    {view.allowedActions.includes("Add Record") && <AddRecordRow key={'add-record-' + view._id} col={columns} /> }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>  
                    </Stack>
                </CardContent>
            </Card>
        </>
    )
}

export default TableView;