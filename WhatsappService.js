class WhatsappService {
  static send(phone, message) {
    // Adapter placeholder: isi endpoint gateway di 00_M_CONFIG jika sudah tersedia.
    // Agar tidak hardcode vendor API, outbound dicatat sebagai notification log.
    Logger.log("WHATSAPP QUEUED to " + phone + ": " + message);
    return true;
  }
}
