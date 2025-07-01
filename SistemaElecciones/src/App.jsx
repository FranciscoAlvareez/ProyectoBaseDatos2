import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Views/login";
import Home from "./Views/home";
import ProtectedRoute from "./Components/protectedRoutes";
import { AuthProvider, useAuth } from "./Context/authContext";
import Navbar from "./Views/navbar";
import "./Styles/globalConfig.css";
import RegisterVoter from './Views/registerVoter';
import Vote from "./Views/vote";
import ManageCircuit from './Views/manageCircuit';

function LayoutWithNavbar({ children }) {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LayoutWithNavbar>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route
              path="/votar"
              element={
                <ProtectedRoute role={["gestor", "ciudadano"]}>
                  <Vote />
                </ProtectedRoute>
              }/>
            <Route path="/votar" element={
              <ProtectedRoute role="admin">
                <RegisterVoter />
              </ProtectedRoute>
            } />
            <Route path="admin/circuitos" element={
              <ProtectedRoute role="admin">
                <ManageCircuit />
              </ProtectedRoute>
            }/>
            <Route path="/unauthorized" element={<p>No autorizado</p>} />
          </Routes>
        </LayoutWithNavbar>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
