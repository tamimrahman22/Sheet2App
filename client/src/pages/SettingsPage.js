import { useState, useContext } from 'react';
import { Typography, Box, Card, CardContent, Stack, Link, Button, TextField } from '@mui/material';
// import Copyright from './Copyright'
// import AuthContext from '../auth'
import GlobalStoreContext from "../components/context/GlobalContext";

export default function ViewsPage() {
    // const { auth } = useContext(AuthContext);
    const store = useContext(GlobalStoreContext);
    const [edit, setEdit] = useState(false);

    function handleEdit() {
      setEdit(true);
    }

    function handleSave() {
      setEdit(false);
      console.log(document.getElementById("app-name").value);
      store.renameApp(document.getElementById("app-name").value);
    }

    function handlePublish() {
      store.publishApp();
    }

    return (
        <div id="settings">
            <Box component="span" sx={{ p: 2 }} key={100}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} >
                      
                            <Box sx={{ minWidth: 240, flexGrow: 1 }}>
                              <Typography color="inherit" variant="h4" underline="hover" noWrap>
                                App Name: 
                              </Typography>
                              { !edit ? <Typography color="inherit" variant="body1" underline="hover" noWrap> {store.currentApp.name}</Typography> : null }
                              { edit ? <TextField fullWidth id="app-name" variant="standard" defaultValue={store.currentApp.name}/> : null }
                      
                              <Typography variant="h4">
                                Role Membership Sheet URL: 
                              </Typography>
                              <Link href={store.currentApp.roleMembershipSheet} target="_blank">{store.currentApp.roleMembershipSheet}</Link>
                            </Box>

                            { !edit ? <Button variant="outlined" onClick={handleEdit}>Edit</Button> : null}
                            { edit ? <Button variant="outlined" onClick={handleSave}>Save</Button> : null}

                            <Box sx={{ mx: 2.5 }} justifyContent="center" display="flex" alignItems="center"> 
                              <Button variant="contained" onClick={handlePublish}>{ !store.currentApp.published ? "Publish" : "Unpublish" }</Button>
                            </Box>
                            
                          </Stack>
                        </CardContent>
                </Card>
            </Box>
        </div>
    );
}