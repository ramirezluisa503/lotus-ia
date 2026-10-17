import { Route, Routes } from "react-router-dom";
import RutaProtegida from "./components/RutaProtegida";
import Autorizacion from "./pages/Autorizacion";
import Cuestionario from "./pages/cuestionario/Cuestionario";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Oferta from "./pages/Oferta";
import Panel from "./pages/Panel";
import Registro from "./pages/Registro";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/panel"
        element={
          <RutaProtegida>
            <Panel />
          </RutaProtegida>
        }
      />
      <Route
        path="/autorizacion"
        element={
          <RutaProtegida>
            <Autorizacion />
          </RutaProtegida>
        }
      />
      <Route
        path="/cuestionario"
        element={
          <RutaProtegida>
            <Cuestionario />
          </RutaProtegida>
        }
      />
      <Route
        path="/oferta"
        element={
          <RutaProtegida>
            <Oferta />
          </RutaProtegida>
        }
      />
    </Routes>
  );
}
