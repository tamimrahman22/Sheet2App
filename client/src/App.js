import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SnackbarProvider } from 'notistack';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components

// ----------------------------------------------------------------------

export default function App() {
  return (
    <HelmetProvider>
      <SnackbarProvider maxSnack={1}>
        <BrowserRouter>
          <ThemeProvider>
            <Router />
          </ThemeProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </HelmetProvider>
  );
}
