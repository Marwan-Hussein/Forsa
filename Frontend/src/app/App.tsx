import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NotificationProvider } from "./contexts/NotificationContext";
import { GlobalRequestLoader } from "./components/Loading";
//import { ForsaIntroAnimation } from "./components/ForsaIntroAnimation/ForsaIntroAnimation";

export default function App() {
  return (
    <NotificationProvider>
      {/* Plays once per real page load/refresh; never replays on SPA navigation. */}
      {/*<ForsaIntroAnimation />*/}

      <RouterProvider router={router} />
      <GlobalRequestLoader />
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
    </NotificationProvider>
  );
}
