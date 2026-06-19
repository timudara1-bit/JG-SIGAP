class WorkflowService {
  static getStep(stepCode) {
    return Repository.safeGetAll(CONFIG.SHEET.WORKFLOW_STEP).find(s => same(s.step_code, stepCode) && isActiveValue(s.is_active));
  }

  static start(documentType, documentId, documentNo, stepCode, user, priorityCode) {
    const step = this.getStep(stepCode) || {};
    const sla = SlaService.resolve(documentType, stepCode, step.pic_role, priorityCode || "NORMAL");
    const start = new Date();
    const due = SlaService.addWorkingHours(start, Number(sla.sla_work_hour || 8), sla.calendar_id);
    const warning = SlaService.subtractWorkingHours(due, Number(sla.warning_before_work_hour || 4), sla.calendar_id);

    const history = {
      history_id: uid("WF-"),
      document_type: documentType,
      document_id: documentId,
      step_code: stepCode,
      step_name: step.step_name || stepCode,
      module_name: step.module_name || "",
      pic_role: step.pic_role || "",
      pic_user_id: "",
      start_time: start,
      warning_time: warning,
      due_time: due,
      end_time: "",
      duration_work_hour: "",
      duration_calendar_hour: "",
      overtime_hour: "",
      sla_work_hour: sla.sla_work_hour || 8,
      remaining_work_hour: "",
      overdue_work_hour: "",
      overdue_calendar_hour: "",
      sla_status: "ON_TRACK",
      action_status: "OPEN",
      remarks: "",
      created_at: start,
      created_by: user ? user.user_id : ""
    };
    Repository.insert(CONFIG.SHEET.WORKFLOW_HISTORY, history);

    DocumentStatusService.upsert(documentType, documentId, documentNo, step, history, priorityCode || "NORMAL");
    SlaService.upsertSnapshot(documentType, documentId, documentNo, step, history, priorityCode || "NORMAL");
    TaskService.createTask(documentType, documentId, documentNo, step, history, user, priorityCode || "NORMAL");
    NotificationService.createForStep(documentType, documentId, documentNo, step, history, "TASK_CREATED", "ALL", user);

    return history;
  }

  static action(payload, user) {
    const documentType = payload.document_type;
    const documentId = payload.document_id;
    const action = payload.action_status || payload.action || "DONE";
    const remarks = payload.remarks || "";

    const current = Repository.safeGetAll(CONFIG.SHEET.WORKFLOW_HISTORY)
      .filter(w => same(w.document_type, documentType) && same(w.document_id, documentId) && same(w.action_status, "OPEN"))
      .pop();

    if (!current) return { success: false, message: "Workflow aktif tidak ditemukan" };

    const end = new Date();
    const duration = SlaService.workingHoursBetween(new Date(current.start_time), end, "");
    const overdue = Math.max(0, SlaService.workingHoursBetween(new Date(current.due_time), end, ""));

    Repository.update(CONFIG.SHEET.WORKFLOW_HISTORY, "history_id", current.history_id, {
      end_time: end,
      action_status: action,
      sla_status: overdue > 0 ? "OVERDUE" : "DONE",
      duration_work_hour: duration,
      overdue_work_hour: overdue,
      remarks
    });

    TaskService.closeTask(documentType, documentId, current.step_code, user, action);

    if (action === "REJECTED" || action === "CANCELLED") {
      DocumentStatusService.setStatus(documentType, documentId, action);
      return { success: true, message: "Workflow dihentikan: " + action };
    }

    const step = this.getStep(current.step_code);
    if (step && step.next_step_code) {
      this.start(documentType, documentId, payload.document_no || documentId, step.next_step_code, user, payload.priority_code || "NORMAL");
    }

    return { success: true, message: "Workflow berhasil diproses" };
  }
}
