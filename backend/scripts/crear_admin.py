"""Crea una cuenta de administrador.

No existe registro público para este rol (REQNF003: control de acceso por
roles) -- se crea desde línea de comandos.

Uso:
    .venv/Scripts/python.exe scripts/crear_admin.py --correo admin@lotusia.com --contrasena "ClaveSegura123" --nombre "Admin Lotus.IA"
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import cifrar_texto, hashear_contrasena  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.rol import Rol  # noqa: E402
from app.models.usuario import Usuario  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--correo", required=True)
    parser.add_argument("--contrasena", required=True)
    parser.add_argument("--nombre", required=True)
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if db.query(Usuario).filter(Usuario.correo == args.correo).first():
            print(f"Ya existe un usuario con el correo {args.correo}")
            return

        rol = db.query(Rol).filter(Rol.nombre == "ADMINISTRADOR").first()
        if rol is None:
            print("No existe el rol ADMINISTRADOR en auth.roles")
            return

        usuario = Usuario(
            correo=args.correo,
            contrasena_hash=hashear_contrasena(args.contrasena),
            nombre_cifrado=cifrar_texto(args.nombre),
            rol_id=rol.id,
        )
        db.add(usuario)
        db.commit()
        print(f"Administrador creado: {args.correo}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
