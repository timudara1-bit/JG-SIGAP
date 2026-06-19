class SlaService {
  static resolve(documentType, stepCode, picRole, priorityCode) {
    const rows = Repository.safeGetAll(CONFIG.SHEET.SLA).filter(r => isActiveValue(r.is_active));
    return rows.find(r => same(r.document_type, documentType) && same(r.step_code, stepCode) && same(r.priority_code, priorityCode) && same(r.pic_role, picRole)) ||
           rows.find(r => same(r.document_type, documentType) && same(r.step_code, stepCode) && same(r.priority_code, priorityCode)) ||
           rows.find(r => same(r.document_type, documentType) && same(r.step_code, stepCode) && same(r.priority_code, "NORMAL")) ||
           { sla_work_hour: 8, warning_before_work_hour: 4, escalation_work_hour: 2, calendar_id: "CAL001" };
  }

  static addWorkingHours(startDate, hours, calendarId) {
    // Working-hour aware calculation: 08:00-12:00 and 13:00-17:00 Mon-Fri by default.
    let d = new Date(startDate);
    let remain = Number(hours || 0) * 60;
    while (remain > 0) {
      d = this.normalizeToWorkingTime(d);
      const end = this.segmentEnd(d);
      const diff = Math.max(0, (end.getTime() - d.getTime()) / 60000);
      const use = Math.min(diff, remain);
      d = new Date(d.getTime() + use * 60000);
      remain -= use;
      if (remain > 0) d = this.nextWorkingSegment(d);
    }
    return d;
  }

  static subtractWorkingHours(dueDate, hours, calendarId) {
    let d = new Date(dueDate);
    let remain = Number(hours || 0) * 60;
    while (remain > 0) {
      d = this.normalizeBackwardToWorkingTime(d);
      const start = this.segmentStart(d);
      const diff = Math.max(0, (d.getTime() - start.getTime()) / 60000);
      const use = Math.min(diff, remain);
      d = new Date(d.getTime() - use * 60000);
      remain -= use;
      if (remain > 0) d = this.prevWorkingSegment(d);
    }
    return d;
  }

  static workingHoursBetween(start, end, calendarId) {
    if (!start || !end || new Date(end) <= new Date(start)) return 0;
    let d = new Date(start);
    const target = new Date(end);
    let minutes = 0;
    while (d < target) {
      d = this.normalizeToWorkingTime(d);
      if (d >= target) break;
      const segEnd = this.segmentEnd(d);
      const upper = segEnd < target ? segEnd : target;
      minutes += Math.max(0, (upper.getTime() - d.getTime()) / 60000);
      d = upper >= segEnd ? this.nextWorkingSegment(segEnd) : upper;
    }
    return Math.round((minutes / 60) * 100) / 100;
  }

  static normalizeToWorkingTime(d) {
    d = new Date(d);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1), d.setHours(8,0,0,0);
    const h = d.getHours() + d.getMinutes()/60;
    if (h < 8) d.setHours(8,0,0,0);
    else if (h >= 12 && h < 13) d.setHours(13,0,0,0);
    else if (h >= 17) d = this.nextWorkingSegment(d);
    return d;
  }

  static normalizeBackwardToWorkingTime(d) {
    d = new Date(d);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1), d.setHours(17,0,0,0);
    const h = d.getHours() + d.getMinutes()/60;
    if (h > 17) d.setHours(17,0,0,0);
    else if (h > 12 && h <= 13) d.setHours(12,0,0,0);
    else if (h <= 8) d = this.prevWorkingSegment(d);
    return d;
  }

  static segmentEnd(d) {
    const h = d.getHours() + d.getMinutes()/60;
    const e = new Date(d);
    if (h < 12) e.setHours(12,0,0,0);
    else e.setHours(17,0,0,0);
    return e;
  }

  static segmentStart(d) {
    const h = d.getHours() + d.getMinutes()/60;
    const s = new Date(d);
    if (h > 13) s.setHours(13,0,0,0);
    else s.setHours(8,0,0,0);
    return s;
  }

  static nextWorkingSegment(d) {
    d = new Date(d);
    const h = d.getHours() + d.getMinutes()/60;
    if (h < 12) d.setHours(13,0,0,0);
    else {
      d.setDate(d.getDate() + 1);
      d.setHours(8,0,0,0);
      while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    }
    return d;
  }

  static prevWorkingSegment(d) {
    d = new Date(d);
    const h = d.getHours() + d.getMinutes()/60;
    if (h > 13) d.setHours(12,0,0,0);
    else {
      d.setDate(d.getDate() - 1);
      d.setHours(17,0,0,0);
      while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
    }
    return d;
  }

  static upsertSnapshot(documentType, documentId, documentNo, step, history, priorityCode) {
    const snap = {
      snapshot_id: uid("SLA-"),
      document_type: documentType,
      document_id: documentId,
      document_no: documentNo,
      step_code: step.step_code || history.step_code,
      step_name: step.step_name || history.step_name,
      module_name: step.module_name || "",
      pic_role: step.pic_role || "",
      pic_user_id: "",
      requester_id: "",
      department_id: "",
      start_time: history.start_time,
      warning_time: history.warning_time,
      due_time: history.due_time,
      last_calculate_at: new Date(),
      age_work_hour: 0,
      age_calendar_hour: 0,
      sla_work_hour: history.sla_work_hour,
      remaining_work_hour: "",
      overdue_work_hour: 0,
      overdue_calendar_hour: 0,
      sla_status: "ON_TRACK",
      document_status: "ON_PROCESS",
      priority_code: priorityCode
    };
    Repository.insert(CONFIG.SHEET.SLA_SNAPSHOT, snap);
  }

  static checkWarningAndOverdue(user) {
    const rows = Repository.safeGetAll(CONFIG.SHEET.SLA_SNAPSHOT).filter(r => !same(r.sla_status, "DONE"));
    let warning = 0, overdue = 0;
    rows.forEach(r => {
      const now = new Date();
      const due = new Date(r.due_time);
      const warn = new Date(r.warning_time);
      let status = "ON_TRACK";
      if (now >= due) status = "OVERDUE";
      else if (now >= warn) status = "WARNING";
      const age = this.workingHoursBetween(new Date(r.start_time), now, "");
      const over = status === "OVERDUE" ? this.workingHoursBetween(due, now, "") : 0;
      Repository.update(CONFIG.SHEET.SLA_SNAPSHOT, "snapshot_id", r.snapshot_id, {
        last_calculate_at: now,
        age_work_hour: age,
        overdue_work_hour: over,
        sla_status: status
      });
      if (status === "WARNING") { WarningService.create(r, "SLA_WARNING", user); warning++; }
      if (status === "OVERDUE") { WarningService.create(r, "OVERDUE", user); overdue++; }
    });
    return { success: true, warning, overdue };
  }
}
