import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import axios from 'axios';
// @mui
// import { useTheme } from '@mui/material/styles';
import { Container, Typography, List, Stack, Box, Link, Card, CardContent} from '@mui/material';
// components
// import Iconify from '../components/iconify';
// sections
// import {
//   AppTasks,
//   AppNewsUpdate,
//   AppOrderTimeline,
//   AppCurrentVisits,
//   AppWebsiteVisits,
//   AppTrafficBySite,
//   AppWidgetSummary,
//   AppCurrentSubject,
//   AppConversionRates,
// } from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  // const theme = useTheme();
  const [ list, setList ] = useState([]);

  useEffect(() => {
    async function getLists() {
      axios.defaults.withCredentials = true;
      const api = axios.create({
        baseURL: 'http://localhost:4000/app',
      });

      const response = await api.get("/list");
      console.log(response);
      console.log(response.data);
      setList(response.data);
    }
    getLists();
    console.log(list);
  }, [list]);

  return (
    <>
      <Helmet>
        <title> S2A Dashboard </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" >
          Your Apps
        </Typography>
        <List sx={{ width: '100%' }}>
            {
                list.map((app) => (
                  <Box component="span" sx={{ p: 2 }} >
                    <Card>
                    <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} key={app._id}>
                      {/* <Box component="img" alt={title} src={image} sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }} /> */}
                
                      <Box sx={{ minWidth: 240, flexGrow: 1 }}>
                        <Link color="inherit" variant="subtitle2" underline="hover" noWrap>
                          {app.name}
                        </Link>
                
                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                          {app.creator}
                        </Typography>
                      </Box>
                
                      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
                        {app.published ? "Published" : "Unpublished"}
                      </Typography>
                      
                    </Stack>
                    </CardContent>
                    </Card>
                  </Box>
                ))
            }
            </List>
      </Container>
    </>
  );
}
