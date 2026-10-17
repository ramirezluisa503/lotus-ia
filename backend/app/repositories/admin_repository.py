from sqlalchemy.orm import Session

from app.models.beca import Beca, BecaArea
from app.models.carrera import Carrera
from app.models.institucion import InstitucionEducativa
from app.models.modelo_ml import ModeloMl


class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    # ---------- Instituciones ----------

    def listar_instituciones(self) -> list[InstitucionEducativa]:
        return self.db.query(InstitucionEducativa).order_by(InstitucionEducativa.nombre).all()

    def obtener_institucion(self, institucion_id: int) -> InstitucionEducativa | None:
        return self.db.get(InstitucionEducativa, institucion_id)

    def guardar_institucion(self, institucion: InstitucionEducativa) -> InstitucionEducativa:
        self.db.add(institucion)
        self.db.commit()
        self.db.refresh(institucion)
        return institucion

    # ---------- Carreras ----------

    def listar_carreras(self) -> list[Carrera]:
        return self.db.query(Carrera).order_by(Carrera.nombre).all()

    def obtener_carrera(self, carrera_id: int) -> Carrera | None:
        return self.db.get(Carrera, carrera_id)

    def guardar_carrera(self, carrera: Carrera) -> Carrera:
        self.db.add(carrera)
        self.db.commit()
        self.db.refresh(carrera)
        return carrera

    # ---------- Becas ----------

    def listar_becas(self) -> list[Beca]:
        return self.db.query(Beca).order_by(Beca.nombre).all()

    def obtener_beca(self, beca_id: int) -> Beca | None:
        return self.db.get(Beca, beca_id)

    def guardar_beca(self, beca: Beca) -> Beca:
        self.db.add(beca)
        self.db.commit()
        self.db.refresh(beca)
        return beca

    def reemplazar_areas_beca(self, beca_id: int, area_ids: list[int]) -> None:
        self.db.query(BecaArea).filter(BecaArea.beca_id == beca_id).delete()
        for area_id in area_ids:
            self.db.add(BecaArea(beca_id=beca_id, area_id=area_id))
        self.db.commit()

    def areas_de_beca(self, beca_id: int) -> list[int]:
        filas = self.db.query(BecaArea.area_id).filter(BecaArea.beca_id == beca_id).all()
        return [a for (a,) in filas]

    # ---------- Modelos de IA ----------

    def listar_modelos(self) -> list[ModeloMl]:
        return self.db.query(ModeloMl).order_by(ModeloMl.entrenado_en.desc()).all()

    def obtener_modelo(self, modelo_id: int) -> ModeloMl | None:
        return self.db.get(ModeloMl, modelo_id)

    def activar_modelo(self, modelo_id: int) -> ModeloMl:
        self.db.query(ModeloMl).update({ModeloMl.activo: False})
        modelo = self.db.get(ModeloMl, modelo_id)
        modelo.activo = True
        self.db.commit()
        self.db.refresh(modelo)
        return modelo
