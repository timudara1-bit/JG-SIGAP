class LoaderService {
  static getConfig(payload, user) {
    return LoaderConfigService.getConfig(payload, user);
  }

  static importData(payload, user) {
    // Payload expected: { target_sheet, rows: [object] }
    const target = payload.target_sheet;
    const rows = payload.rows || [];
    if (!target) throw new Error("target_sheet wajib diisi");
    let success = 0;
    rows.forEach(r => { Repository.insert(target, r); success++; });
    Repository.insert(CONFIG.SHEET.IMPORT_LOG, {
      import_id: uid("IMP-"),
      module_name: payload.module_name || "",
      file_name: payload.file_name || "",
      import_date: new Date(),
      import_by: user.user_id,
      total_row: rows.length,
      success_row: success,
      failed_row: rows.length - success,
      status: "SUCCESS",
      remarks: ""
    });
    return { success: true, total: rows.length, success_row: success };
  }
}
