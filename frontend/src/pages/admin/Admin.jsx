import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { listarInstitucionesAdmin } from "../../services/adminService";
import BecasTab from "./BecasTab";
import CarrerasTab from "./CarrerasTab";
import InstitucionesTab from "./InstitucionesTab";
import ModelosTab from "./ModelosTab";

const PESTANAS = [
  { id: "instituciones", etiqueta: "Instituciones" },
  { id: "carreras", etiqueta: "Carreras" },
  { id: "becas", etiqueta: "Becas" },
  { id: "modelos", etiqueta: "Modelos de IA" },
];

export default function Admin() {
  const [pestana, setPestana] = useState("instituciones");
  const [instituciones, setInstituciones] = useState([]);

  useEffect(() => {
    listarInstitucionesAdmin().then(setInstituciones).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-xl font-semibold text-navy">Panel de administración</h1>
        <p className="mt-1 text-sm text-navy/60">
          Gestiona instituciones, carreras, becas y el modelo de IA activo.
        </p>

        <div className="mt-6 flex gap-1 border-b border-navy/10">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPestana(p.id)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                pestana === p.id
                  ? "border-teal text-teal"
                  : "border-transparent text-navy/50 hover:text-navy"
              }`}
            >
              {p.etiqueta}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {pestana === "instituciones" && <InstitucionesTab />}
          {pestana === "carreras" && <CarrerasTab instituciones={instituciones} />}
          {pestana === "becas" && <BecasTab instituciones={instituciones} />}
          {pestana === "modelos" && <ModelosTab />}
        </div>
      </main>
    </div>
  );
}
