class DashboardService {

  static getDashboardData() {
    return {
      fpb: this.getCountByPeriod(CONFIG.SHEET.FPB_HEADER, "request_date"),
      pp: this.getCountByPeriod(CONFIG.SHEET.PP_HEADER, "pp_date"),
      pr: this.getCountByPeriod(CONFIG.SHEET.PR_HEADER, "pr_date"),
      receive: this.getCountByPeriod(CONFIG.SHEET.RECEIVE_HEADER, "receive_date"),
      invoice: this.getCountByPeriod(CONFIG.SHEET.INVOICE_HEADER, "invoice_date"),
      payment: this.getCountByPeriod(CONFIG.SHEET.PAYMENT_HEADER, "payment_date"),
      status: this.getStatusSummary()
    };
  }

  static getStatusSummary() {
    const result = {};
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET.DOCUMENT_STATUS);
    if (!sheet) return result;

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return result;

    const headers = values[0];
    const rows = values.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });

    rows.forEach(r => {
      const moduleName = r.current_module || "UNKNOWN";
      const status = r.status || "UNKNOWN";
      const key = moduleName + "_" + status;
      result[key] = (result[key] || 0) + 1;
    });

    return result;
  }

  static getCountByPeriod(sheetName, dateFieldOrColumn) {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    const empty = {
      hari: 0,
      minggu: 0,
      bulan: 0,
      tahun: 0,
      total: 0
    };

    if (!sheet) return empty;

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return empty;

    const headers = data[0];
    const rows = data.slice(1);

    let dateIndex;
    if (typeof dateFieldOrColumn === "number") {
      dateIndex = dateFieldOrColumn - 1;
    } else {
      dateIndex = headers.indexOf(dateFieldOrColumn);
    }

    if (dateIndex < 0) return {
      ...empty,
      total: rows.length
    };

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday);
    startWeek.setDate(startToday.getDate() - startToday.getDay());
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startYear = new Date(now.getFullYear(), 0, 1);

    const result = {
      hari: 0,
      minggu: 0,
      bulan: 0,
      tahun: 0,
      total: rows.length
    };

    rows.forEach(row => {
      const raw = row[dateIndex];
      if (!raw) return;

      const trxDate = raw instanceof Date ? raw : new Date(raw);
      if (isNaN(trxDate.getTime())) return;

      if (trxDate >= startToday) result.hari++;
      if (trxDate >= startWeek) result.minggu++;
      if (trxDate >= startMonth) result.bulan++;
      if (trxDate >= startYear) result.tahun++;
    });

    return result;
  }
}
