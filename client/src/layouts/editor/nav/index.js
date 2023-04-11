import PropTypes from 'prop-types';
import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Box, Link, Drawer } from '@mui/material';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import SettingsIcon from '@mui/icons-material/Settings';
// mock
// hooks
import useResponsive from '../../../useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
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

  const isDesktop = useResponsive('up', 'lg');
  const store = useContext(GlobalContext);
  let navConfig = []

  console.log(`[JONATHAN] NAV ROLE ${store.userRole}`)

  if (store.userRole === "Developer") {
    navConfig = [
      {
        title: 'Data Sources',
        path: '/editor/data',
        icon: <TableRowsIcon/>,
      },
      {
        title: 'Views',
        path: '/editor/views',
        icon: <ViewCarouselIcon/>
      },
      {
        title: 'App Settings',
        path: '/editor/settings',
        icon: <SettingsIcon/>
      }
    ];
  }
  else {
    navConfig = [
      {
        title: 'Views',
        path: '/editor/views',
        icon: <ViewCarouselIcon/>
      },
    ];
  }

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none">
          
        </Link>
      </Box>

      <NavSection data={navConfig} />

      <Box sx={{ flexGrow: 1 }} />
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
    </Box>
  );
}
