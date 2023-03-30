import { Helmet } from 'react-helmet-async';
// @mui
import { Typography, Grid, CssBaseline, Box } from '@mui/material';
// hooks
// import useResponsive from '../useResponsive';
// components
import Logo from '../components/logo';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import AuthContext from '../components/context/AuthContext';
// sections

// ----------------------------------------------------------------------

export default function LoginPage() {
  // const mdUp = useResponsive('up', 'md');
  const navigate = useNavigate();
  const {user, setUser} = useContext(AuthContext);

  // function handleSignOut() {
  //   setUser({});
  //   document.getElementById("signInDiv").hidden = false;
  // }

  function handleCallBackResponse(response){
    //console.log("TOKEN IS: ", response.credential);
    var userObject = jwt_decode(response.credential);

    // Store the user credentials in localStorage
    localStorage.setItem('user', JSON.stringify(userObject));
    
    //Set the Auth Context with the info of the user since they are logged in!
    setUser(userObject);
  }

  // Dynamically load in the Google Button so we can have the use login with their Google Account 
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "382110346041-m240qc561dnte39gobhn1f0int19uusr.apps.googleusercontent.com",
      callback: handleCallBackResponse
    });

     // Check for stored user credentials
     const storedUser = JSON.parse(localStorage.getItem('user'));
  
     // Set the authenticated user in the AuthContext if user credentials are found
     if (storedUser) {
       setUser(storedUser);
     }

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      {   
        theme: "outlined", 
        size: "large", 
      }
    );
  }, [])

  return (
    <>
      <Helmet>
        <title> S2A Login </title>
      </Helmet>

      {/* <Navbar/> */}

      <Grid container sx={{ height: '100%' }}>
        <CssBaseline />
        <Grid item sm={4} md={7} paddingTop={15}>
          <Box justifyContent="center" display="flex" alignItems="center">
            <Box
              component="img"
              src="/assets/logo/s2a_logo_large.png"
              width={300}
              paddingTop={5}
            />
          </Box>
            <Box
              justifyContent="center" 
              display="flex" 
              flexDirection = 'column'
              alignItems="center" 
            >
              <Typography component="h2" variant="h4" align="center" paddingTop={5}>
                Welcome to S2A!
              </Typography>
              <Typography component="h2" variant="h4" align="center" >
                This application allows you to create Apps from Google Sheets. 
              </Typography>
              <Typography component="h2" variant="h4" align="center" >
                Please use your Google Account to get started!
              </Typography>
            </Box>
          <Box 
            justifyContent="center" 
            display="flex" 
            alignItems="center" 
            id="signInDiv" 
            paddingTop={5}
          />
        </Grid>
        <Grid item xs={12} sm={8} md={5}
          sx={{
              backgroundImage: 'url(https://source.unsplash.com/random?technology)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }}>
        </Grid>
      </Grid>

    </>
  );
}
