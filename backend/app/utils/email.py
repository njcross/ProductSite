import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_bulk_email(subject, body, emails):
    sender_email = "your_email@gmail.com"
    sender_password = "your_app_password"  # Use an app-specific password, NOT your main password.

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)

        for recipient in emails:
            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = recipient
            msg["Subject"] = subject

            msg.attach(MIMEText(body, "plain"))  # Use "html" instead of "plain" for rich HTML emails.

            server.sendmail(sender_email, recipient, msg.as_string())

        server.quit()
        return True, "Emails sent successfully"
    except Exception as e:
        return False, str(e)
