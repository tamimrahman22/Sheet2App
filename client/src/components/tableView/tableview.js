import { useEffect, useState, useRef } from 'react';
import Paper from '@mui/material/Paper';
import { Typography, Card, CardContent, Stack, Box, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, Collapse} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from "../../api";

function TableView(props) {
    const { view } = props;
    // console.log(view);
    const length = useRef(0)
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
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
            length.current = response.data[0].length + 1;
        }
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function Row(props) {
        const { row } = props;
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
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={length.current}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    LONG AMOUNT OF TEXT LONG AMOUNT OF TEXT LONG AMOUNT OF TEXT LONG AMOUNT OF TEXT LONG AMOUNT OF TEXT LONG AMOUNT OF TEXT LONG AMOUNT OF TEXT LONG AMOUNT OF TEXT LONG AMOUNT OF TEXT 
                                </Typography>
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
                        <Typography color="inherit" variant="h6" underline="hover" noWrap>
                            {view.name}
                        </Typography>
                      
                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                            View Type: {view.viewType}
                        </Typography>
                        
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
                                {
                                    data.map(row => {
                                        return (
                                            <Row row={row} />
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