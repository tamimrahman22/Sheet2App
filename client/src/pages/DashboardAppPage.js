import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
// @mui
// import { useTheme } from '@mui/material/styles';
import { Container, Typography, List, Stack, Box, Link, Card, CardContent} from '@mui/material';
import GlobalContext from '../components/context/GlobalContext';
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
  const store = useContext(GlobalContext);

  console.log('[DASHBOARD APP PAGE] Store is: ', store);

  useEffect(() => {
    store.loadAppList();
  }, []);

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
                store.appList.map((app) => (
                  <Box component="span" sx={{ p: 2 }} >
                    <Card>
                    <Link to="/editor" component={RouterLink} sx={{ display: 'contents' }}>
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
                    </Link>
                    </Card>
                  </Box>
                ))
            }
            </List>
      </Container>
    </>
  );
}
