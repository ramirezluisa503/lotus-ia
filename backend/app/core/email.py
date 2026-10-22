import smtplib
from email.mime.text import MIMEText

from app.core.config import get_settings

settings = get_settings()


def enviar_correo_recuperacion(destinatario: str, enlace: str) -> None:
    cuerpo = (
        "Recibimos una solicitud para restablecer tu contraseña en Lotus.IA.\n\n"
        f"Si fuiste tú, abre este enlace (válido por 30 minutos):\n{enlace}\n\n"
        "Si no fuiste tú, puedes ignorar este correo: tu contraseña seguirá siendo la misma."
    )
    mensaje = MIMEText(cuerpo)
    mensaje["Subject"] = "Recupera tu contraseña de Lotus.IA"
    mensaje["From"] = settings.email_from
    mensaje["To"] = destinatario

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as servidor:
        servidor.starttls()
        servidor.login(settings.smtp_user, settings.smtp_password)
        servidor.send_message(mensaje)
