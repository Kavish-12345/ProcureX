import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { router } from './router';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </>
  );
}