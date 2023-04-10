import { useState, useContext } from 'react';
import { Typography, Box, Card, CardContent, Stack, Link, Button, TextField, IconButton, Modal, FormControl, Select, MenuItem, Chip } from '@mui/material';
import { Helmet } from 'react-helmet-async';
// import AuthContext from '../auth'
import GlobalStoreContext from "../components/context/GlobalContext";
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';

export default function ViewsPage() {
    // const { auth } = useContext(AuthContext);
    const store = useContext(GlobalStoreContext);
    const [edit, setEdit] = useState(false);
    const [appName, setAppName] = useState(store.currentApp.name);
    const [open, setOpen] = useState(false);

    function handleSave() {
      setEdit(false);
      console.log(appName);
      store.renameApp(appName);
    }

    function handlePublish() {
      store.publishApp();
    }

    function openModal(event) {
      // Close the modal! 
      setOpen(true)
    }

    function closeModal(event) {
      // Close the modal! 
      setOpen(false)
    }

    function handleDelete() {
      closeModal();
      store.deleteApp();
    }

    const style = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 500,
      height: 200,
      bgcolor: 'background.paper',
      p: 4,
      borderRadius: '10px',
      // alignItems: "center",
      // textAlign: "center",
      // justifyContent: "center"
    };

    function RoleSelection(props) {
      const { role } = props;
      const [actions, setActions] = useState(role.allowedActions);

      function handleSelect(event) {
        const {
          target: { value },
        } = event;
        setActions(
          value
        );
        console.log(value);
        store.setAppRoles(role, value);
      }

      return (
        <>
          <Typography color="inherit" variant="h6" underline="hover" noWrap sx={{ pt: 1 }}>
            {role.name}
          </Typography>
          <FormControl sx={{ m: 1, width: 500 }}>
            <Select
              labelId="demo-multiple-chip-label"
              id="demo-multiple-chip"
              multiple
              value={actions}
              onChange={handleSelect}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                  <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              >
              <MenuItem key={"Add Record"} value={"Add Record"}>
                Add Record
              </MenuItem>
              <MenuItem key={"Edit Record"} value={"Edit Record"}>
                Edit Record
              </MenuItem>
              <MenuItem key={"Delete Record"} value={"Delete Record"}>
                Delete Record
              </MenuItem>
              <MenuItem key={"View Record"} value={"View Record"}>
                View Record
              </MenuItem>
            </Select>
          </FormControl>
        </>
      )
    }

    return (
      <>
        <div id="settings">
          <Helmet>
          <title> S2A App Settings </title>
          </Helmet>
          <Typography variant="h4" >
                App Settings
          </Typography>
          <Box component="span" sx={{ p: 2 }} key={100}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} >
            
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="inherit" variant="h5" underline="hover" noWrap>
                      App Name: 
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {edit ?
                        <TextField
                          label = 'Enter a name for the app'
                          variant='standard'
                          value = {appName}
                          onChange={(e) => {
                              setAppName(e.target.value)
                          }}
                          sx={{ width: "35%" }}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  handleSave();
                              }
                          }}
                        />
                        :
                        <Typography color="inherit" variant="body1" underline="hover" noWrap> {store.currentApp.name}</Typography>
                      }
                      {edit ?
                        <>
                          <IconButton
                              // sx={{ bgcolor: 'green', color: 'white' }}
                              // disableRipple
                              color='success'
                              onClick={() => handleSave()}
                          >
                              <DoneIcon></DoneIcon>
                          </IconButton>

                          <IconButton
                              // sx={{ bgcolor: 'red', color: 'white'}}
                              // disableRipple
                              color = "error"
                              onClick={() => setEdit(false)}
                          >
                              <ClearIcon></ClearIcon>
                          </IconButton>
                        </>
                        :
                        <IconButton
                          onClick={() => {
                            setEdit(true)
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      }
                    </Box>
                    <br></br>
                    <Typography variant="h5">
                      Role Membership Sheet URL: 
                    </Typography>
                    <Link href={store.currentApp.roleMembershipSheet} target="_blank">{store.currentApp.roleMembershipSheet}</Link>
                  </Box>

                  <Box sx={{ mx: 2.5 }} justifyContent="left" alignItems="center"> 
                    <Button variant="contained" onClick={handlePublish} sx={{ mb: 1 }}>{ !store.currentApp.published ? "Publish" : "Unpublish" }</Button>
                    <br />
                    <Button variant="contained" color="error" onClick={openModal}>Delete</Button>
                  </Box>
                  
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box component="span" sx={{ p: 2 }} key={200}>
            <Card>
              <CardContent>
                <Typography color="inherit" variant="h5" underline="hover" noWrap>
                  Role Permissions:
                </Typography>
                {
                  store.currentApp.roles.map(role => {
                    if (role.name === "Developer") {
                      return <></>
                    }
                    return (
                      <RoleSelection key={role.name} role={role} />
                    )
                  })
                }
              </CardContent>
            </Card>
          </Box>
        </div>
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx = {style} justifyContent="center" alignItems="center">
              <Box>
                  <Typography id="modal-modal-title" variant="h5" component="h2">
                      Are you sure you want to delete <br/> {appName}?
                  </Typography>
              </Box>
              <Box m={1}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center" 
                  paddingTop={2}
              >
                  <Button variant="outlined" onClick={closeModal}>Cancel</Button>
                  <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
              </Box>
          </Box>
        </Modal>
      </>
    );
}