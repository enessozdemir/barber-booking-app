import { Provider } from "react-redux";
import { store } from "./modules/app/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./modules/auth/pages/LoginPage";
import RegisterPage from "./modules/auth/pages/RegisterPage";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage";
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage";
import HomePage from "./modules/home/pages/HomePage";
import ProtectedRoute from "./modules/auth/components/ProtectedRoute";
import AppInitializer from "./modules/auth/components/AppInitializer";
import setupAxios from "./config/setupAxios";

// Setup axios interceptors
setupAxios();

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer>
          <div>
            <ToastContainer autoClose={3000} pauseOnHover={false} theme="dark" />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:id/:token" element={<ResetPasswordPage />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<LoginPage />} />
            </Routes>
          </div>
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
