import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Box, Drawer, Typography, Button, Modal, TextField } from '@mui/material';
// mock
// hooks
import useResponsive from '../../../useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import navConfig from './config';

import AuthContext from '../../../components/context/AuthContext';
import GlobalContext from '../../../components/context/GlobalContext';
// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const auth = useContext(AuthContext)
  const store = useContext(GlobalContext)

  console.log('[NAV] User is: ', auth.user)
  console.log('[NAV] Store is: ', store)

  const isDesktop = useResponsive('up', 'lg');
  const [open, setOpen] = useState(false);

  const [appName, setAppName] = useState('');
  const [roleSheet, setRoleSheet] = useState ('');

  const handleClose = () => setOpen(false);

  // Style for the modal!
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    height: 300,
    bgcolor: 'background.paper',
    p: 4,
    borderRadius: '10px',
    // alignItems: "center",
    // textAlign: "center",
    // justifyContent: "center"
  };

  const account = {
    displayName: auth.user ? auth.user.given_name + ' ' + auth.user.family_name : '',
    email: auth.user ? auth.user.email : '',
    photoURL: auth.user ? auth.user.picture.replace(/['"]+/g, '') : '',
  };

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function showCreateAppModal() {
    setOpen(true);
  }

  async function handleCreateApp(event) {
    event.stopPropagation()
    setOpen(false);
    store.createApp(appName, auth.user.email, roleSheet);
    // Set the states back to their default value! 
    setAppName('');
    setRoleSheet('');
  }

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }} justifyContent="center" display="flex" alignItems="center">
        <Logo />
      </Box>

      <Box sx={{ mb: 5, mx: 2.5 }} justifyContent="center" display="flex" alignItems="center"> 
        <Button variant="contained" onClick={showCreateAppModal}>Create App</Button>
      </Box>

      <NavSection data={navConfig} />

      <Box sx={{ flexGrow: 1 }} justifyContent="center" display="flex" alignItems="center"/>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} justifyContent="center" alignItems="center">
          <Box>
            <Typography id="modal-modal-title" variant="h5" component="h2">
              Create App
            </Typography>
          </Box>
          <Box paddingTop={1}>
            <TextField fullWidth id="standard-basic" label="App Name" variant="standard" onChange={(e) => setAppName(e.target.value)}/>
          </Box>
          <Box paddingTop={2}>
            <TextField fullWidth id="standard-basic" label="Roles Sheet" variant="standard" onChange={(e) => setRoleSheet(e.target.value)}/>
          </Box>
          <Box m={1}
              display="flex"
              justifyContent="space-between"
              alignItems="center" 
              paddingTop={4}
          >
              <Button variant="outlined" color="error" onClick={handleClose}>Cancel</Button>
              <Button variant="contained" onClick={handleCreateApp}>Create</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
