class ModuleService {
  static cfg(moduleKey) {
    const cfg = CONFIG.MODULES[moduleKey];
    if (!cfg) throw new Error("Module tidak dikenal: " + moduleKey);
    return cfg;
  }

  static getModuleList(payload, user) {
    const cfg = this.cfg(payload.module);
    const sheet = CONFIG.SHEET[cfg.header];
    let rows = Repository.safeGetAll(sheet);
    rows = DataFilter.apply(rows, payload.filters || {});
    return { success: true, data: rows, total: rows.length };
  }

  static getDocument(payload, user) {
    const cfg = this.cfg(payload.module);
    const headerSheet = CONFIG.SHEET[cfg.header];
    const detailSheet = CONFIG.SHEET[cfg.detail];

    const idValue = payload.id || payload.document_id;
    const header = Repository.findOne(headerSheet, cfg.id, idValue) ||
                   Repository.findOne(headerSheet, cfg.no, idValue);

    if (!header) return { success: false, message: "Dokumen tidak ditemukan" };

    const details = Repository.findBy(detailSheet, cfg.id, header[cfg.id]);
    const attachments = Repository.findBy(CONFIG.SHEET.DOCUMENT_ATTACHMENT, "document_id", header[cfg.id]);
    const status = Repository.findOne(CONFIG.SHEET.DOCUMENT_STATUS, "document_id", header[cfg.id]);
    const workflow = Repository.findBy(CONFIG.SHEET.WORKFLOW_HISTORY, "document_id", header[cfg.id]);

    return { success: true, data: { header, details, attachments, status, workflow } };
  }

  static saveDocument(payload, user) {
    const cfg = this.cfg(payload.module);
    const headerSheet = CONFIG.SHEET[cfg.header];
    const detailSheet = CONFIG.SHEET[cfg.detail];

    const header = payload.header || {};
    if (!header[cfg.id]) header[cfg.id] = uid(cfg.docType + "-");
    if (!header[cfg.no]) header[cfg.no] = NumberingService.next(cfg.docType);
    header.updated_at = new Date();
    if (!header.created_at) header.created_at = new Date();
    if (!header.created_by && user) header.created_by = user.user_id;
    if (!header.status) header.status = "DRAFT";

    Repository.upsert(headerSheet, cfg.id, header);

    const details = payload.details || [];
    details.forEach((d, idx) => {
      if (!d[cfg.id]) d[cfg.id] = header[cfg.id];
      const detailIdField = Object.keys(d).find(k => k.indexOf("_detail_id") !== -1) || "detail_id";
      if (!d[detailIdField]) d[detailIdField] = uid("DTL-");
      Repository.upsert(detailSheet, detailIdField, d);
    });

    AuditService.log(user, "SAVE", cfg.docType, header[cfg.id], "", header, "Simpan dokumen");
    return { success: true, data: { header, details } };
  }

  static submitDocument(payload, user) {
    const saved = this.saveDocument(payload, user);
    if (!saved.success) return saved;

    const cfg = this.cfg(payload.module);
    const header = saved.data.header;
    Repository.update(CONFIG.SHEET[cfg.header], cfg.id, header[cfg.id], { status: "SUBMITTED", current_step: cfg.step, updated_at: new Date() });
    WorkflowService.start(cfg.docType, header[cfg.id], header[cfg.no], cfg.step, user, header.priority_code || "NORMAL");
    AuditService.log(user, "SUBMIT", cfg.docType, header[cfg.id], "", header, "Submit dokumen");

    return { success: true, data: header, message: "Dokumen berhasil disubmit" };
  }
}

class DataFilter {
  static apply(rows, filters) {
    filters = filters || {};
    return rows.filter(r => {
      if (filters.search) {
        const s = JSON.stringify(r).toLowerCase();
        if (s.indexOf(String(filters.search).toLowerCase()) === -1) return false;
      }
      if (filters.status && !same(r.status || r.document_status || r.sla_status, filters.status)) return false;
      if (filters.priority_code && !same(r.priority_code, filters.priority_code)) return false;
      if (filters.department_id && !same(r.department_id, filters.department_id)) return false;
      return true;
    });
  }
}
