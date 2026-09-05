import { createHashRouter, Navigate } from 'react-router';
import { DemoLayout } from '../app/layout/DemoLayout';
import { BottomPage } from '../pages/BottomPage';
import { CustomCardPage } from '../pages/CustomCardPage';
import { DrawerPage } from '../pages/DrawerPage';
import { FloatPage } from '../pages/FloatPage';
import { HomePage } from '../pages/HomePage';
import { ModalPage } from '../pages/ModalPage';
import { PopupPage } from '../pages/PopupPage';
import { SidebarPage } from '../pages/SidebarPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <DemoLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'sidebar', element: <SidebarPage /> },
      { path: 'popup', element: <PopupPage /> },
      { path: 'float', element: <FloatPage /> },
      { path: 'bottom', element: <BottomPage /> },
      { path: 'drawer', element: <DrawerPage /> },
      { path: 'modal', element: <ModalPage /> },
      { path: 'custom-card', element: <CustomCardPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
