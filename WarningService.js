class WarningService {
  static create(snapshot, warningType, user) {
    const exists = Repository.safeGetAll(CONFIG.SHEET.WARNING_LOG).some(w =>
      same(w.document_id, snapshot.document_id) &&
      same(w.step_code, snapshot.step_code) &&
      same(w.warning_type, warningType) &&
      same(w.status, "OPEN")
    );
    if (exists) return null;

    const data = {
      warning_id: uid("WRN-"),
      document_type: snapshot.document_type,
      document_id: snapshot.document_id,
      document_no: snapshot.document_no,
      task_id: "",
      step_code: snapshot.step_code,
      step_name: snapshot.step_name,
      warning_type: warningType,
      warning_level: warningType === "OVERDUE" ? "HIGH" : "MEDIUM",
      target_role: snapshot.pic_role,
      target_user_id: snapshot.pic_user_id,
      target_email: "",
      target_whatsapp: "",
      message: warningType + " pada dokumen " + snapshot.document_no + " segment " + snapshot.step_name,
      trigger_time: new Date(),
      due_time: snapshot.due_time,
      overdue_work_hour: snapshot.overdue_work_hour || 0,
      notification_id: "",
      status: "OPEN",
      created_at: new Date()
    };
    Repository.insert(CONFIG.SHEET.WARNING_LOG, data);
    NotificationService.create({
      document_type: data.document_type,
      document_id: data.document_id,
      document_no: data.document_no,
      task_id: "",
      notification_type: warningType,
      notification_channel: "ALL",
      notification_level: data.warning_level,
      target_role: data.target_role,
      target_user_id: data.target_user_id,
      target_email: "",
      target_whatsapp: "",
      subject: "[JG-SIGAP] " + warningType + " - " + data.document_no,
      message: data.message,
      action_url: "#/monitoring",
      created_by: user ? user.user_id : ""
    });
    return data;
  }
}
