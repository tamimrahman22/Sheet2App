import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button } from '@mui/material';
// hooks
import useResponsive from '../useResponsive';
// components
import Logo from '../components/logo';
import Iconify from '../components/iconify';
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

      <StyledRoot>
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />

        {mdUp && (  
          <StyledSection>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
              Hi, Welcome Back
            </Typography>
            <img src="/assets/illustrations/illustration_login.png" alt="login" />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom>
              Sign in to S2A
            </Typography>

            <Stack direction="row" spacing={2}>
              <div id="signInDiv"></div>
            </Stack>
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
