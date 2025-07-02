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
import CreateElection from "./Views/createElecction";
import ManageCircuit from './Views/manageCircuit';
import VoteObserved from "./Views/voteObserved";
import CreatePartido from "./Views/createPartido";
import CreateLista from './Views/createLista';

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
              path="/votar" element={
                <ProtectedRoute allowedRoles={["gestor", "ciudadano"]}>
                  <Vote />
                </ProtectedRoute>
              }/>
            <Route path="/votoObservado" element={
                <ProtectedRoute allowedRoles={["gestor"]}>
                  <VoteObserved />
                </ProtectedRoute>
            }/>
            <Route path="/admin/registerVoter" element={
              <ProtectedRoute allowedRoles="admin">
                <RegisterVoter />
              </ProtectedRoute>
            } />
            <Route path="/admin/createElection" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateElection />
              </ProtectedRoute>
            } />
            <Route path="/admin/createPartido" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreatePartido />
              </ProtectedRoute>
            } />
             <Route path="/admin/createLista" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateLista />
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
