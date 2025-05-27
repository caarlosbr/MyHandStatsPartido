import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login";
import Registrar from "./views/Registrar";
import DashboardPartido from "./views/DashboardPartido.jsx";
import Jugadores from "./views/Jugadores.jsx";
import SeleccionEquipo from "./views/SeleccionarEquipo.jsx";
import './index.css';
import DashboardPartidoPruebas from "./views/DashboardPartidoPruebas.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/nuevo-partido" element={<DashboardPartido />} />
        <Route path="/jugadores" element={<Jugadores />} />
        <Route path="/seleccionar-equipo" element={<SeleccionEquipo />} />
{/*         <Route path="/dashboard-partido-pruebas" element={<DashboardPartidoPruebas />} /> */}      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
