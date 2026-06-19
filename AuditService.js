class AuditService {
  static log(user, action, documentType, documentId, oldValue, newValue, remarks) {
    try {
      Repository.insert(CONFIG.SHEET.AUDIT_LOG, {
        audit_id: uid("AUD-"),
        timestamp: new Date(),
        user_id: user && user.user_id ? user.user_id : "",
        username: user && user.username ? user.username : "",
        role_code: user && user.roles ? user.roles.join(",") : "",
        module_name: documentType || "",
        action: action || "",
        document_type: documentType || "",
        document_id: documentId || "",
        old_value: oldValue ? JSON.stringify(oldValue) : "",
        new_value: newValue ? JSON.stringify(newValue) : "",
        ip_address: "",
        device_info: "",
        remarks: remarks || ""
      });
    } catch (err) {
      Logger.log("Audit failed: " + err.message);
    }
  }
}
