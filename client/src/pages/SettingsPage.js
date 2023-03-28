// import { useContext } from 'react';
import { Typography, Box, Card, CardContent, Stack } from '@mui/material';
// import Copyright from './Copyright'
// import AuthContext from '../auth'
// import GlobalStoreContext from '../store'

export default function ViewsPage() {
    // const { auth } = useContext(AuthContext);
    // const { store } = useContext(GlobalStoreContext);

    return (
        <div id="settings">
            <Box component="span" sx={{ p: 2 }} key={100}>
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} >
                      
                            <Box sx={{ minWidth: 240, flexGrow: 1 }}>
                              <Typography color="inherit" variant="h3" underline="hover" noWrap>
                                App Name: 
                              </Typography>
                      
                              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                hello
                              </Typography>
                            </Box>
                      
                            <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
                              hello
                            </Typography>
                            
                          </Stack>
                        </CardContent>
                </Card>
            </Box>
        </div>
    );
}