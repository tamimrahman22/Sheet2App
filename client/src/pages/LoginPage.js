import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button, TextField, FormControlLabel, Checkbox, Grid, CssBaseline, Paper, Box, Avatar } from '@mui/material';
// hooks
import useResponsive from '../useResponsive';
// components
import Logo from '../components/logo';
import Navbar from '../components/navbar/Navbar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from "jwt-decode";
// sections

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 1000,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  const mdUp = useResponsive('up', 'md');
  const navigate = useNavigate();

  const [ user, setUser ] = useState({});

  function handleInitalizeCallback(response) {
    console.log("TOKEN: " + response.credential);
    var user = jwt_decode(response.credential);
    console.log(user);
    setUser(user);
    document.getElementById("signInDiv").hidden = true;
    navigate('/dashboard', { replace: true });
  }

  // function handleSignOut() {
  //   setUser({});
  //   document.getElementById("signInDiv").hidden = false;
  // }
  
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "382110346041-m240qc561dnte39gobhn1f0int19uusr.apps.googleusercontent.com",
      callback: handleInitalizeCallback
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large"}
    );
  })

  return (
    <>
      <Helmet>
        <title> S2A Login </title>
      </Helmet>

      {/* <Navbar/> */}

      <Grid container sx={{ height: '95%' }}>
        <CssBaseline />
        <Grid item sm={4} md={7}>
          <Box justifyContent="center" display="flex" alignItems="center">
            <Box
              component="img"
              src="/assets/logo/s2a_logo_large.png"
              width={300}
              paddingTop={5}
            />
          </Box>
          <Typography component="h2" variant="h4" align="center" paddingTop={5}>
            Welcome to S2A!
          </Typography>
          <Typography component="h2" variant="h4" align="center" >
            This application allows you to create Apps from Google Sheets. 
          </Typography>
          <Typography component="h2" variant="h4" align="center" >
            Please use your Google Account to get started!
          </Typography>
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
              backgroundImage: 'url(https://source.unsplash.com/random)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }}>
        </Grid>
      </Grid>

    </>
  );
}