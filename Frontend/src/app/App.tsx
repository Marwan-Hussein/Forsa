import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import { ForsaIntroAnimation } from "./components/ForsaIntroAnimation/ForsaIntroAnimation";

export default function App() {
  return (
    <>
      {/* Plays once per real page load/refresh; never replays on SPA navigation. */}
      {/*<ForsaIntroAnimation />*/}

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
