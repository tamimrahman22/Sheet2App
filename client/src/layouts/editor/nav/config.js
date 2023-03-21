// component
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';

// ----------------------------------------------------------------------

const navConfig = [
  {
    title: 'data sources',
    path: '/editor/data',
    icon: <TableRowsIcon/>,
  },
  {
    title: 'views',
    path: '/editor/views',
    icon: <ViewCarouselIcon/>
  }
];

export default navConfig;
