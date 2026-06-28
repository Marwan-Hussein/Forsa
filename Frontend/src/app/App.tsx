import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import TicketSpinner from "./components/TicketSpinner";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null; // Quick flicker, no need for spinner
  }

  return <RouterProvider router={router} />;
}