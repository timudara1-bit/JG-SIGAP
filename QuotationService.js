/*************************************************
 * QUOTATION SERVICE
 * JG-SIGAP V3
 *
 * Fungsi:
 * - Mengelompokkan beberapa quotation berdasarkan satu FPB
 * - Mencari harga terendah
 * - Menandai vendor terpilih
 * - Membuat vendor comparison
 * - Menyiapkan data underlying dari quotation terpilih
 *************************************************/

class QuotationService {
  static selectLowest(payload, user) {
    const fpbId = payload.fpb_id || "";
    const fpbNo = payload.fpb_no || "";

    let rows = Repository.safeGetAll(CONFIG.SHEET.QUOTATION_HEADER);

    if (fpbId) rows = rows.filter(r => same(r.fpb_id, fpbId));
    if (fpbNo) rows = rows.filter(r => same(r.fpb_no, fpbNo));

    if (!rows.length) {
      return { success: false, message: "Quotation untuk FPB ini belum ada." };
    }

    const grouped = {};
    rows.forEach(r => {
      const key = r.fpb_id || r.fpb_no;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    const result = [];

    Object.keys(grouped).forEach(key => {
      const group = grouped[key]
        .map(r => {
          r._amount = Number(r.quotation_amount || r.total_amount || r.grand_total || 0);
          return r;
        })
        .filter(r => r._amount > 0)
        .sort((a, b) => a._amount - b._amount);

      if (!group.length) return;

      group.forEach((q, idx) => {
        Repository.update(CONFIG.SHEET.QUOTATION_HEADER, "quotation_id", q.quotation_id, {
          ranking: idx + 1,
          is_selected: idx === 0 ? 1 : 0,
          status: idx === 0 ? "SELECTED" : "COMPARED",
          updated_at: new Date(),
          updated_by: user.user_id
        });

        this.upsertComparison_(q, idx + 1, idx === 0, user);
      });

      result.push({
        fpb_id: group[0].fpb_id,
        fpb_no: group[0].fpb_no,
        selected_quotation_id: group[0].quotation_id,
        selected_vendor_id: group[0].vendor_id,
        selected_vendor_name: group[0].vendor_name,
        selected_amount: group[0]._amount
      });
    });

    AuditService.log(user, "SELECT_LOWEST_QUOTATION", "QUOTATION", fpbId || fpbNo, "", result, "Pilih quotation harga terendah");
    return { success: true, data: result, message: "Harga terendah berhasil dipilih." };
  }

  static createUnderlyingFromQuotation(payload, user) {
    const selection = this.selectLowest(payload, user);
    if (!selection.success) return selection;

    const selected = selection.data[0];
    if (!selected) return { success: false, message: "Vendor terpilih tidak ditemukan." };

    const underlyingId = uid("UND-");
    const underlyingNo = NumberingService.next("UNDERLYING");

    const header = {
      underlying_id: underlyingId,
      underlying_no: underlyingNo,
      fpb_id: selected.fpb_id,
      fpb_no: selected.fpb_no,
      selected_vendor_id: selected.selected_vendor_id,
      vendor_id: selected.selected_vendor_id,
      vendor_name: selected.selected_vendor_name,
      total_amount: selected.selected_amount,
      recommendation_reason: "Vendor dengan harga penawaran terendah berdasarkan perbandingan quotation.",
      status: "DRAFT",
      current_step: "UNDERLYING_CREATED",
      created_at: new Date(),
      created_by: user.user_id,
      updated_at: new Date(),
      updated_by: user.user_id
    };

    Repository.insert(CONFIG.SHEET.UNDERLYING_HEADER, this.cleanByHeaders_(CONFIG.SHEET.UNDERLYING_HEADER, header));

    Repository.insert(CONFIG.SHEET.DOCUMENT_LINK, this.cleanByHeaders_(CONFIG.SHEET.DOCUMENT_LINK, {
      link_id: uid("LINK-"),
      source_document_type: "FPB",
      source_document_id: selected.fpb_id,
      source_document_no: selected.fpb_no,
      target_document_type: "UNDERLYING",
      target_document_id: underlyingId,
      target_document_no: underlyingNo,
      relation_type: "QUOTATION_SELECTED",
      created_at: new Date(),
      created_by: user.user_id
    }));

    AuditService.log(user, "CREATE_UNDERLYING_FROM_QUOTATION", "UNDERLYING", underlyingId, "", header, "Buat underlying dari quotation terpilih");

    return {
      success: true,
      message: "Underlying berhasil dibuat dari quotation terpilih.",
      data: header
    };
  }

  static upsertComparison_(quotation, ranking, isSelected, user) {
    const comparisonId = "CMP-" + String(quotation.quotation_id || "").replace(/[^A-Za-z0-9]/g, "");
    const data = {
      comparison_id: comparisonId,
      fpb_id: quotation.fpb_id,
      fpb_no: quotation.fpb_no,
      quotation_id: quotation.quotation_id,
      quotation_no: quotation.quotation_no,
      vendor_id: quotation.vendor_id,
      vendor_name: quotation.vendor_name,
      quotation_amount: quotation._amount || quotation.quotation_amount || quotation.total_amount,
      ranking: ranking,
      is_recommended: isSelected ? 1 : 0,
      is_selected: isSelected ? 1 : 0,
      remarks: isSelected ? "Harga terendah / rekomendasi vendor terpilih" : "Vendor pembanding",
      created_at: new Date(),
      created_by: user.user_id,
      updated_at: new Date(),
      updated_by: user.user_id
    };

    const headers = Repository.headers(CONFIG.SHEET.VENDOR_COMPARISON);
    Repository.upsert(CONFIG.SHEET.VENDOR_COMPARISON, headers.indexOf("comparison_id") !== -1 ? "comparison_id" : headers[0], this.cleanObjectByHeaders_(data, headers));
  }

  static cleanByHeaders_(sheetName, data) {
    return this.cleanObjectByHeaders_(data, Repository.headers(sheetName));
  }

  static cleanObjectByHeaders_(data, headers) {
    const out = {};
    headers.forEach(h => {
      if (data[h] !== undefined) out[h] = data[h];
    });
    return out;
  }
}
