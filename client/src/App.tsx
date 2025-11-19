import { Provider } from "react-redux";
import { store } from "./modules/app/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./modules/auth/pages/LoginPage";
import RegisterPage from "./modules/auth/pages/RegisterPage";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage";
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage";
import RoleBasedHome from "./modules/home/components/RoleBasedHome";
import ProfilePage from "./modules/profile/pages/ProfilePage";
import ProtectedRoute from "./modules/auth/components/ProtectedRoute";
import AppInitializer from "./modules/auth/components/AppInitializer";
import setupAxios from "./config/setupAxios";

// Setup axios interceptors
setupAxios();

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <RoleBasedHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
