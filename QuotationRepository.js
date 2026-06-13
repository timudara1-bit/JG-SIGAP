/**
 * Quotation lama sekarang menjadi Vendor Comparison di Underlying.
 * File ini dipertahankan sebagai adapter agar kode lama tidak langsung error.
 */
class QuotationRepository {

  static save(data) {
    const sheet = Repository.getSheet(CONFIG.SHEET.VENDOR_COMPARISON);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const rowObject = {
      comparison_id: data.comparison_id || data.quotation_id || Utilities.getUuid(),
      detail_id: data.detail_id || data.underlying_detail_id || data.fpb_detail_id || "",
      underlying_detail_id: data.underlying_detail_id || data.detail_id || "",
      vendor_id: data.vendor_id || "",
      price: data.price || data.quotation_value || 0,
      is_selected: data.is_selected || data.selected_vendor || false,
      remarks: data.remarks || data.file_url || ""
    };

    const row = headers.map(h => rowObject[h] !== undefined ? rowObject[h] : "");
    sheet.appendRow(row);
  }
}
