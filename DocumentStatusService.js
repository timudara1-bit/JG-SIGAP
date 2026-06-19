class DocumentStatusService {
  static upsert(documentType, documentId, documentNo, step, history, priorityCode) {
    const existing = Repository.findOne(CONFIG.SHEET.DOCUMENT_STATUS, "document_id", documentId);
    const data = {
      status_id: existing ? existing.status_id : uid("DS-"),
      document_type: documentType,
      document_id: documentId,
      document_no: documentNo,
      current_step_code: step.step_code || history.step_code,
      current_step_name: step.step_name || history.step_name,
      current_module: step.module_name || "",
      current_pic_role: step.pic_role || "",
      current_pic_user_id: "",
      requester_id: "",
      department_id: "",
      start_date: existing ? existing.start_date : new Date(),
      last_update: new Date(),
      warning_time: history.warning_time,
      due_time: history.due_time,
      age_work_hour: 0,
      age_calendar_hour: 0,
      sla_work_hour: history.sla_work_hour,
      remaining_work_hour: "",
      overdue_work_hour: 0,
      overdue_calendar_hour: 0,
      sla_status: "ON_TRACK",
      document_status: "ON_PROCESS",
      priority_code: priorityCode,
      created_at: existing ? existing.created_at : new Date(),
      updated_at: new Date()
    };
    Repository.upsert(CONFIG.SHEET.DOCUMENT_STATUS, "status_id", data);
  }

  static setStatus(documentType, documentId, status) {
    const existing = Repository.findOne(CONFIG.SHEET.DOCUMENT_STATUS, "document_id", documentId);
    if (existing) Repository.update(CONFIG.SHEET.DOCUMENT_STATUS, "status_id", existing.status_id, { document_status: status, updated_at: new Date() });
  }
}
