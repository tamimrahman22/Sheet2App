import { useEffect, useState, } from 'react';
import Paper from '@mui/material/Paper';
import { Typography, Card, CardContent, LinearProgress, Stack, Box, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, Collapse, Grid, TextField, Button } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from "../../api";

function TableView(props) {
    const { view } = props;
    // console.log(view);
    const length = view.columns.length + 1
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            let response = await api.getDataSourceById(view.table);
            console.log(response.data.url);
            let payload = {
                url: response.data.url,
                name: "Sheet1"
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

    function Row(props) {
        const { row, col } = props;
        const [open, setOpen] = useState(false);

        return (
            <>
                <TableRow onClick={() => {console.log("clicked"); setOpen(!open)}}>
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
                                                        <TextField fullWidth id="app-name" variant="outlined" defaultValue={row[index]}/>
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
                            <Typography color="inherit" variant="h6" underline="hover" noWrap sx={{ pt: 1 }}>
                                {view.name}
                            </Typography>
                            <Button variant="contained">Add Record</Button>
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
                                    data.map(row => {
                                        return (
                                            <Row row={row} col={view.columns}/>
                                        )
                                    }) 
                                }
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