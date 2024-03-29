import { Helmet } from 'react-helmet-async';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Container, Typography, List, Stack, Box, Card, CardContent, CardActionArea, Snackbar, Alert } from '@mui/material';
import GlobalContext from '../components/context/GlobalContext';
import AuthContext from "../components/context/AuthContext";

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  // const theme = useTheme();
  const store = useContext(GlobalContext);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  console.log('[DASHBOARD APP PAGE] Store is: ', store);

  useEffect(() => {
    window.sessionStorage.clear();
    store.loadAppList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                store.appList.map(app => {
                  let userRole = "";
                  if (app.creator === auth.user.email) {
                    userRole = "Developer";
                  }
                  else {
                    for (let i = 0; i < app.roles.length; i++) {
                      if (app.roles[i].users.includes(auth.user.email)) {
                        userRole = app.roles[i].name;
                        break;
                      }
                    }
                  }
                  console.log(userRole);
                  if (!app.published && userRole !== "Developer") {
                    return null;
                  }
                  if (userRole === "") {
                    return null;
                  }
                  return (
                    <>
                      <Box component="span" sx={{ p: 2 }} key={app._id}>
                        <Card>
                          <CardActionArea sx={{ display: 'contents' }} onClick={() => {
                            console.log ('[DASHBOARD APP] Current list is: ', app)
                            // SET THE CURRENT APPLICATION!
                            store.setApp(app)
                            store.setUserRole(userRole)
                            if (store.userRole === "Developer") {
                              navigate("/editor");
                            }
                            else {
                              navigate("/editor/views");
                            }
                          }}>
                            <CardContent>
                              <Stack direction="row" alignItems="center" spacing={2} >
                                <Box sx={{ minWidth: 240, flexGrow: 1 }}>
                                  <Typography color="inherit" variant="subtitle2" underline="hover" noWrap>
                                    {app.name}
                                  </Typography>
                          
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                    {app.creator}
                                  </Typography>
                                </Box>
                          
                                <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
                                  {app.published ? "Published" : "Unpublished"}
                                </Typography>
                                
                              </Stack>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Box>
                    </>
                  )
                })
            }
            </List>
      </Container>
    </>
  );
}
