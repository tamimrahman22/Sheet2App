import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import EditorLayout from "./layouts/editor";
import SimpleLayout from './layouts/simple';
//
// import BlogPage from './pages/BlogPage';
// import UserPage from './pages/UserPage';
// import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import DashboardAppPage from './pages/DashboardAppPage';
import DataSourcesPage from './pages/DataSourcesPage';
import ViewsPage from './pages/ViewsPage';
import { AuthContextProvider } from './components/context/AuthContext';
import { GlobalContextProvider } from './components/context/GlobalContext';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/',
      element: 
      <AuthContextProvider>
        <LoginPage />
      </AuthContextProvider>,
    },
    {
      path: '/dashboard',
      element: 
      <AuthContextProvider>
        <GlobalContextProvider>
          <DashboardLayout />
        </GlobalContextProvider>
      </AuthContextProvider>,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        // { path: 'user', element: <UserPage /> },
        // { path: 'products', element: <ProductsPage /> },
        // { path: 'blog', element: <BlogPage /> },
      ],
    },
    {
      path: '/editor',
      element: 
      <AuthContextProvider>
        <GlobalContextProvider>
          <EditorLayout />
        </GlobalContextProvider>
      </AuthContextProvider>,
      children: [
        { element: <Navigate to="/editor/data" />, index: true },
        { path: 'data', element: <DataSourcesPage />},
        { path: 'views', element: <ViewsPage />}
      ],
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
      path: '/',
      element: 
      <AuthContextProvider>
        <LoginPage />
      </AuthContextProvider>,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
