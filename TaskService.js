class TaskService {
  static createTask(documentType, documentId, documentNo, step, history, user, priorityCode) {
    const task = {
      task_id: uid("TSK-"),
      document_type: documentType,
      document_id: documentId,
      document_no: documentNo,
      source_module: step.module_name || "",
      current_step_code: step.step_code || history.step_code,
      current_step_name: step.step_name || history.step_name,
      task_title: "Proses " + (step.step_name || history.step_name),
      task_description: "Silakan proses dokumen " + documentNo,
      assigned_role: step.pic_role || "",
      assigned_user_id: "",
      requester_id: user ? user.user_id : "",
      department_id: user ? user.department_id : "",
      priority_code: priorityCode,
      task_status: "OPEN",
      sla_status: "ON_TRACK",
      start_time: history.start_time,
      warning_time: history.warning_time,
      due_time: history.due_time,
      completed_time: "",
      age_work_hour: 0,
      remaining_work_hour: "",
      overdue_work_hour: 0,
      action_url: "#/" + (step.module_name || "").toLowerCase(),
      created_at: new Date(),
      created_by: user ? user.user_id : "",
      updated_at: "",
      updated_by: ""
    };
    Repository.insert(CONFIG.SHEET.USER_TASK, task);
    return task;
  }

  static getMyTasks(payload, user) {
    const rows = Repository.safeGetAll(CONFIG.SHEET.USER_TASK)
      .filter(r => same(r.assigned_user_id, user.user_id) || (user.roles || []).indexOf(String(r.assigned_role || "")) !== -1 || same(r.requester_id, user.user_id));
    return { success: true, data: DataFilter.apply(rows, payload.filters || {}) };
  }

  static updateTask(payload, user) {
    Repository.update(CONFIG.SHEET.USER_TASK, "task_id", payload.task_id, {
      task_status: payload.task_status,
      updated_at: new Date(),
      updated_by: user.user_id
    });
    Repository.insert(CONFIG.SHEET.TASK_HISTORY, {
      task_history_id: uid("TH-"),
      task_id: payload.task_id,
      document_type: payload.document_type || "",
      document_id: payload.document_id || "",
      document_no: payload.document_no || "",
      step_code: payload.step_code || "",
      old_status: payload.old_status || "",
      new_status: payload.task_status || "",
      assigned_role: payload.assigned_role || "",
      assigned_user_id: payload.assigned_user_id || "",
      action_by: user.user_id,
      action_time: new Date(),
      remarks: payload.remarks || "",
      created_at: new Date()
    });
    return { success: true };
  }

  static closeTask(documentType, documentId, stepCode, user, action) {
    const rows = Repository.safeGetAll(CONFIG.SHEET.USER_TASK)
      .filter(t => same(t.document_type, documentType) && same(t.document_id, documentId) && same(t.current_step_code, stepCode) && !same(t.task_status, "DONE"));
    rows.forEach(t => Repository.update(CONFIG.SHEET.USER_TASK, "task_id", t.task_id, {
      task_status: action === "DONE" || action === "APPROVED" ? "DONE" : action,
      completed_time: new Date(),
      updated_at: new Date(),
      updated_by: user.user_id
    }));
  }
}
