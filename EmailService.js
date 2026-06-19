class EmailService {
  static send(to, subject, body) {
    if (!to) return false;
    MailApp.sendEmail({
      to: to,
      subject: subject || CONFIG.APP.NAME,
      htmlBody: String(body || "").replace(/\n/g, "<br>")
    });
    return true;
  }
}
