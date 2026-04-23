import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import TicketSpinner from "./components/TicketSpinner";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <TicketSpinner />;
  }

  return <RouterProvider router={router} />;
}