class DashboardService {
  static getDashboardData(payload, user) {
    try {
      const data = this.collectProcurementData_();
      return {
        success: true,
        data: data
      };
    } catch (err) {
      return {
        success: false,
        message: "Gagal load dashboard: " + (err.message || err),
        data: {
          summary: { total: 0, onTrack: 0, warning: 0, overdue: 0, done: 0, taskOpen: 0, myTask: 0, slaAchievement: 0 },
          segments: [],
          myTasks: [],
          warnings: [],
          bottlenecks: [],
          activities: []
        }
      };
    }
  }

  static getMonitoringData(payload, user) {
    return this.getDashboardData(payload, user);
  }

  static collectProcurementData_() {
    const fpbs = Repository.safeGetAll(CONFIG.SHEET.FPB_HEADER);
    const statuses = Repository.safeGetAll(CONFIG.SHEET.DOCUMENT_STATUS);
    const snapshots = Repository.safeGetAll(CONFIG.SHEET.SLA_SNAPSHOT);
    const tasks = Repository.safeGetAll(CONFIG.SHEET.USER_TASK);
    const warnings = Repository.safeGetAll(CONFIG.SHEET.WARNING_LOG);
    const bottlenecks = Repository.safeGetAll(CONFIG.SHEET.BOTTLENECK_SNAPSHOT);
    const audits = Repository.safeGetAll(CONFIG.SHEET.AUDIT_LOG);

    const documents = [];

    // 1. Ambil semua document_status sebagai sumber utama monitoring jika sudah ada.
    statuses.forEach(function(r) {
      const docId = r.document_id || r.fpb_id || r.fpb_no || r.document_no || "";
      if (!docId) return;

      documents.push({
        document_id: docId,
        document_no: r.document_no || r.fpb_no || docId,
        document_type: r.document_type || r.module || "FPB",
        current_step: r.current_step_code || r.current_step || r.current_step_name || r.step_name || r.current_module || "UNKNOWN",
        current_pic: r.current_pic || "",
        status: r.document_status || r.status || "OPEN",
        sla_status: r.sla_status || "ON_TRACK",
        source: "DOCUMENT_STATUS"
      });
    });

    // 2. Tambahkan FPB sebagai fallback/awal proses.
    fpbs.forEach(function(f) {
      const fpbId = f.fpb_id || "";
      const fpbNo = f.fpb_no || fpbId;
      const exists = documents.some(function(d) {
        return String(d.document_id) === String(fpbId) || String(d.document_no) === String(fpbNo);
      });

      if (!exists) {
        const status = f.status || "DRAFT";
        documents.push({
          document_id: fpbId,
          document_no: fpbNo,
          document_type: "FPB",
          current_step: DashboardService.stepFromFPBStatus_(status),
          current_pic: "",
          status: status,
          sla_status: DashboardService.slaFromStatus_(status),
          source: "FPB_HEADER"
        });
      }
    });

    const total = documents.length;
    const done = documents.filter(d => DashboardService.same_(d.status, "DONE") || DashboardService.same_(d.status, "CLOSED") || DashboardService.same_(d.status, "APPROVED")).length;
    const overdue = documents.filter(d => DashboardService.same_(d.sla_status, "OVERDUE") || DashboardService.same_(d.status, "OVERDUE")).length;
    const warning = documents.filter(d => DashboardService.same_(d.sla_status, "WARNING") || DashboardService.same_(d.status, "WARNING")).length;
    const onTrack = Math.max(0, total - warning - overdue);

    const summary = {
      total: total,
      onTrack: onTrack,
      warning: warning,
      overdue: overdue,
      done: done,
      taskOpen: tasks.filter(r => DashboardService.same_(r.task_status, "OPEN") || DashboardService.same_(r.task_status, "IN_PROGRESS")).length,
      myTask: tasks.length,
      slaAchievement: total ? Math.round((onTrack + done) / total * 100) : 0,
      fpbSubmitted: fpbs.filter(f => DashboardService.same_(f.status, "SUBMITTED")).length,
      fpbDraft: fpbs.filter(f => DashboardService.same_(f.status, "DRAFT")).length
    };

    const segMap = {};
    documents.forEach(function(d) {
      const key = d.current_step || "UNKNOWN";
      if (!segMap[key]) segMap[key] = { step: key, count: 0, warning: 0, overdue: 0, done: 0 };
      segMap[key].count++;
      if (DashboardService.same_(d.sla_status, "WARNING") || DashboardService.same_(d.status, "WARNING")) segMap[key].warning++;
      if (DashboardService.same_(d.sla_status, "OVERDUE") || DashboardService.same_(d.status, "OVERDUE")) segMap[key].overdue++;
      if (DashboardService.same_(d.status, "DONE") || DashboardService.same_(d.status, "APPROVED")) segMap[key].done++;
    });

    // 3. Jika SLA snapshot sudah ada, gabungkan sebagai info tambahan, tetapi bukan satu-satunya sumber total.
    snapshots.forEach(function(r) {
      const key = r.step_name || r.step_code || "SLA";
      if (!segMap[key]) segMap[key] = { step: key, count: 0, warning: 0, overdue: 0, done: 0 };
      if (DashboardService.same_(r.sla_status, "WARNING")) segMap[key].warning++;
      if (DashboardService.same_(r.sla_status, "OVERDUE")) segMap[key].overdue++;
    });

    return {
      summary: summary,
      segments: Object.values(segMap),
      documents: documents,
      myTasks: tasks.slice(-5).reverse(),
      warnings: warnings.slice(-10).reverse(),
      bottlenecks: bottlenecks.slice(-5).reverse(),
      activities: audits.slice(-8).reverse()
    };
  }

  static stepFromFPBStatus_(status) {
    status = String(status || "").toUpperCase();
    if (status === "DRAFT") return "FPB_DRAFT";
    if (status === "SUBMITTED") return "FPB_SUBMITTED";
    if (status === "APPROVED") return "FPB_APPROVED";
    if (status === "REJECTED") return "FPB_REJECTED";
    if (status === "DONE" || status === "CLOSED") return "DONE";
    return status || "FPB";
  }

  static slaFromStatus_(status) {
    status = String(status || "").toUpperCase();
    if (status === "SUBMITTED" || status === "DRAFT" || status === "APPROVED") return "ON_TRACK";
    if (status === "DONE" || status === "CLOSED") return "DONE";
    return "ON_TRACK";
  }

  static same_(a, b) {
    return String(a || "").toUpperCase() === String(b || "").toUpperCase();
  }
}
