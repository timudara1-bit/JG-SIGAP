class NumberingService {
  static next(moduleCode) {
    const rows = Repository.safeGetAll(CONFIG.SHEET.NUMBERING);
    let row = rows.find(r => same(r.module_code, moduleCode) && isActiveValue(r.is_active));
    if (!row) {
      return moduleCode + Utilities.formatDate(new Date(), CONFIG.APP.TIMEZONE, "yyyyMMddHHmmss");
    }
    const next = Number(row.last_number || row.running_number || 0) + 1;
    const digit = Number(row.digit_length || 4);
    const number = String(next).padStart(digit, "0");
    const prefix = String(row.prefix || moduleCode);
    const ym = Utilities.formatDate(new Date(), CONFIG.APP.TIMEZONE, "yyyyMM");
    Repository.update(CONFIG.SHEET.NUMBERING, "numbering_id", row.numbering_id, { last_number: next, running_number: next, updated_at: new Date() });
    return prefix + ym + number;
  }
}
