import { Route, Routes } from "react-router-dom";
import RutaProtegida from "./components/RutaProtegida";
import Home from "./pages/Home";
import Login from "./pages/Login";
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
    </Routes>
  );
}
