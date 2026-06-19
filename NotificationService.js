class NotificationService {
  static create(payload) {
    const data = Object.assign({
      notification_id: uid("NTF-"),
      send_status: "PENDING",
      send_attempt: 0,
      created_at: new Date()
    }, payload);
    Repository.insert(CONFIG.SHEET.NOTIFICATION, data);
    return data;
  }

  static createForStep(documentType, documentId, documentNo, step, history, type, channel, user) {
    const employees = Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE);
    const target = employees.find(e => same(e.employee_id, history.pic_user_id)) || {};
    return this.create({
      document_type: documentType,
      document_id: documentId,
      document_no: documentNo,
      task_id: "",
      notification_type: type,
      notification_channel: channel || "IN_APP",
      notification_level: type === "OVERDUE" ? "HIGH" : "INFO",
      target_role: step.pic_role || "",
      target_user_id: history.pic_user_id || "",
      target_email: target.email || "",
      target_whatsapp: target.phone || "",
      subject: "[JG-SIGAP] " + type + " - " + documentNo,
      message: "Dokumen " + documentNo + " masuk segment " + (step.step_name || step.step_code) + ". Due time: " + history.due_time,
      action_url: "#/" + (step.module_name || "").toLowerCase(),
      created_by: user ? user.user_id : ""
    });
  }

  static getNotifications(payload, user) {
    const rows = Repository.safeGetAll(CONFIG.SHEET.NOTIFICATION)
      .filter(r => same(r.target_user_id, user.user_id) || (user.roles || []).indexOf(String(r.target_role || "")) !== -1 || !r.target_user_id);
    return { success: true, data: rows.slice(-100).reverse() };
  }

  static markRead(payload, user) {
    Repository.update(CONFIG.SHEET.NOTIFICATION, "notification_id", payload.notification_id, { read_at: new Date(), send_status: "READ" });
    return { success: true };
  }

  static sendPending() {
    const rows = Repository.safeGetAll(CONFIG.SHEET.NOTIFICATION).filter(r => same(r.send_status, "PENDING"));
    let sent = 0, failed = 0;
    rows.forEach(r => {
      try {
        if (String(r.notification_channel || "").indexOf("EMAIL") !== -1 && r.target_email) EmailService.send(r.target_email, r.subject, r.message);
        if (String(r.notification_channel || "").indexOf("WHATSAPP") !== -1 && r.target_whatsapp) WhatsappService.send(r.target_whatsapp, r.message);
        Repository.update(CONFIG.SHEET.NOTIFICATION, "notification_id", r.notification_id, {
          send_status: "SENT",
          sent_at: new Date(),
          last_attempt_at: new Date(),
          send_attempt: Number(r.send_attempt || 0) + 1
        });
        sent++;
      } catch (err) {
        Repository.update(CONFIG.SHEET.NOTIFICATION, "notification_id", r.notification_id, {
          send_status: "FAILED",
          last_attempt_at: new Date(),
          send_attempt: Number(r.send_attempt || 0) + 1
        });
        failed++;
      }
    });
    return { success: true, sent, failed };
  }
}
