// component
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import SettingsIcon from '@mui/icons-material/Settings';

// ----------------------------------------------------------------------

const navConfig = [
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

export default navConfig;
