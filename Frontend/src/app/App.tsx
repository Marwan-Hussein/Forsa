import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import TicketSpinner from "./components/TicketSpinner";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null; // Quick flicker, no need for spinner
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer 
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}