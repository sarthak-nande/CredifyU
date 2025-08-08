import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import './index.css';
import store from './redux/store';
import { Toaster } from 'sonner';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './component/DashboardLayout';
import AddStudent from './component/AddStudent';
import { StudentTable } from './component/StudentTable';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from './context/AuthContext';
import { RouterProvider } from 'react-router';
import PublicRoutes from './context/PublicRoutes';
import Scanner from './pages/Scanner';
import Home from './pages/Home';
import CollegeName from './pages/CollegeName';
import SavedInfo from './pages/SavedInfo';
import InfoCard from './pages/InfoCard';
import UserRole from './pages/UserRole';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/register',
        element: <AuthLayout><Signup /></AuthLayout>,
      },
      {
        path: '/login',
        element: <PublicRoutes><Login /></PublicRoutes>
      },
      {
        path: '/college/dashboard',
        element: <AuthLayout><Dashboard>
          </Dashboard></AuthLayout>,
      },
      {
        path: '/college/dashboard/students',
        element: <AuthLayout><Dashboard><AddStudent /><StudentTable /></Dashboard></AuthLayout>,
      },
      {
        path: 'student/scanner',
        element: <Scanner />
      },
      {
        path: '/student/college-name',
        element: <CollegeName />
      },
      {
        path: '/student/saved-info',
        element: <SavedInfo />
      },
      {
        path: '/student/saved-info/card',
        element: <InfoCard />
      },
      {
        path: '/user/select-role',
        element: <UserRole />
      }
    ]
  }

])

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
    <Toaster />
  </Provider>
);
