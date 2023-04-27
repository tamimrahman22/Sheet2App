import { useContext, useState, useEffect } from 'react';
import { Card, CardContent, Stack, Box, TextField, Typography, IconButton, InputLabel, FormControl, Select, MenuItem, Chip, Modal, Button, } from "@mui/material";
import api from "../../api";
import GlobalContext from '../../components/context/GlobalContext';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';

function DeveloperView(props) {
    const { view } = props;
    const store = useContext(GlobalContext);
    const [editMode, setEditMode] = useState(false);
    const [viewToEdit, setViewtoEdit] = useState(null);
    const [viewName, setViewName] = useState(null);
    const [open, setOpen] = useState(false);
    // const [url, setUrl] = useState("");
    // const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const tableActions = ["Add Record", "Delete Record"];
    const detailActions = ["Edit Record"];

    useEffect(() => {
        async function fetchData() {
            let url = ""
            let response = await api.getDataSourceById(view.table);
            url = response.data.url;
            // setUrl(url);
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
                // setData(response.data);
            
                console.log("SHEET DATA ADDED TO SESSION STORAGE");
            }
            else {
                const cache = JSON.parse(sessionStorage.getItem(url));
                console.log(cache);
                setColumns(cache.shift());
                // setData(cache);
                console.log("SHEET DATA RETRIEVED FROM SESSION STORAGE");
            }
        }
        fetchData();
    }, [view.table, view.updatedAt]);

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

    return (
        <>
            <Card>
                <CardContent>
                    <Stack >
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
                                    <IconButton onClick={openModal} sx={{ verticalAlign: 'top' }}>
                                        <DeleteIcon />
                                    </IconButton>
                                    </Box>
                                </Stack>
                        </Box>
                                           
                        <Typography variant="subtitle1" sx={{ px:1, mb: 2, flexShrink: 0, color: 'text.secondary' }}>
                            View Type: {view.viewType}
                        </Typography>

                        {view.viewType === "Table" && <FormControl sx={{ m: 1, width: 500 }}>
                            <InputLabel id="columns-chip-label">Columns</InputLabel>
                            <Select
                                labelId="columns-chip-label"
                                label="Columns"
                                id="columns-chip"
                                multiple
                                value={view.columns}
                                onChange={(e) => store.setViewColumns(view._id, view.viewType, e.target.value)}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {
                                    columns.map((col, index) => (
                                        <MenuItem value={col} key={index}>{col}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl> }
                        {view.viewType === "Detail" && <FormControl sx={{ m: 1, width: 500 }}>
                            <InputLabel id="columns-chip-label">Editable Columns</InputLabel>
                            <Select
                                labelId="columns-chip-label"
                                label="Editable Columns"
                                id="columns-chip"
                                multiple
                                value={view.editable}
                                onChange={(e) => store.setViewColumns(view._id, view.viewType, e.target.value)}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {
                                    columns.map((col, index) => (
                                        <MenuItem value={col} key={index}>{col}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl> }

                        <FormControl sx={{ m: 1, width: 500 }}>
                            <InputLabel id="roles-chip-label">Roles</InputLabel>
                            <Select
                                labelId="roles-chip-label"
                                label="Roles"
                                id="roles-chip"
                                multiple
                                value={view.roles}
                                onChange={(e) => store.setViewRoles(view._id, e.target.value)}
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
                        <FormControl sx={{ m: 1, width: 500 }}>
                            <InputLabel id="allowedActions-select-label">Allowed Actions</InputLabel>
                            <Select
                                labelId="allowedActions-select-label"
                                id="allowedActions-select"
                                multiple
                                value={view.allowedActions}
                                label="Allowed Actions"
                                onChange={(e) => store.setViewActions(view._id, e.target.value)}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                    ))}
                                    </Box>
                                )}
                            >
                                {
                                    view.viewType === "Table" ?
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

export default DeveloperView;