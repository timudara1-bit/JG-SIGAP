class MasterDataService {
  static map() {
    return {
      user: CONFIG.SHEET.USER,
      role: CONFIG.SHEET.ROLE,
      department: CONFIG.SHEET.DEPARTMENT,
      employee: CONFIG.SHEET.EMPLOYEE,
      vendor: CONFIG.SHEET.VENDOR,
      company: CONFIG.SHEET.COMPANY,
      site: CONFIG.SHEET.SITE,
      cost_center: CONFIG.SHEET.COST_CENTER,
      category: CONFIG.SHEET.ITEM_CATEGORY,
      location: CONFIG.SHEET.LOCATION,
      sla: CONFIG.SHEET.SLA,
      workflow_step: CONFIG.SHEET.WORKFLOW_STEP,
      approval_matrix: CONFIG.SHEET.APPROVAL_MATRIX,
      menu: CONFIG.SHEET.MENU,
      role_menu: CONFIG.SHEET.ROLE_MENU,
      loader_config: CONFIG.SHEET.LOADER_CONFIG
    };
  }

  static getMasterData(payload, user) {
    const sheet = this.map()[payload.type];
    if (!sheet) throw new Error("Master type tidak dikenal: " + payload.type);
    const rows = DataFilter.apply(Repository.safeGetAll(sheet), payload.filters || {});
    return { success: true, data: rows, headers: Repository.headers(sheet) };
  }

  static saveMasterData(payload, user) {
    const sheet = this.map()[payload.type];
    if (!sheet) throw new Error("Master type tidak dikenal: " + payload.type);
    const headers = Repository.headers(sheet);
    const key = payload.key || headers[0];
    const data = payload.data || {};
    if (!data[key]) data[key] = uid((payload.type || "M").toUpperCase() + "-");
    data.updated_at = new Date();
    if (!data.created_at) data.created_at = new Date();
    Repository.upsert(sheet, key, data);
    AuditService.log(user, "SAVE_MASTER", payload.type, data[key], "", data, "Save master data");
    return { success: true, data };
  }

  static deleteMasterData(payload, user) {
    const sheet = this.map()[payload.type];
    const headers = Repository.headers(sheet);
    const key = payload.key || headers[0];
    const ok = Repository.softDelete(sheet, key, payload.id);
    return { success: ok };
  }
}
