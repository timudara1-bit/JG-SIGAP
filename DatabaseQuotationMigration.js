/*************************************************
 * DATABASE MIGRATION - QUOTATION MODULE
 * JG-SIGAP V3
 *
 * Jalankan satu kali:
 * migrateQuotationModuleV4()
 *************************************************/

function migrateQuotationModuleV4() {
  const ss = Repository.ss();

  ensureSheetWithHeaders_("15_T_QUOTATION_HEADER", [
    "quotation_id",
    "quotation_no",
    "fpb_id",
    "fpb_no",
    "vendor_id",
    "vendor_name",
    "quotation_date",
    "valid_until",
    "currency",
    "quotation_amount",
    "discount_amount",
    "tax_amount",
    "grand_total",
    "payment_term",
    "delivery_time",
    "warranty",
    "ranking",
    "is_selected",
    "status",
    "remarks",
    "created_at",
    "created_by",
    "updated_at",
    "updated_by"
  ]);

  ensureSheetWithHeaders_("16_T_QUOTATION_DETAIL", [
    "quotation_detail_id",
    "quotation_id",
    "quotation_no",
    "fpb_id",
    "fpb_detail_id",
    "item_code",
    "item_name",
    "item_description",
    "qty",
    "uom",
    "unit_price",
    "discount_amount",
    "tax_amount",
    "line_total",
    "remarks",
    "created_at",
    "created_by",
    "updated_at",
    "updated_by"
  ]);

  syncQuotationMenuV4_();

  return {
    success: true,
    message: "Migration quotation selesai. Sheet quotation dan menu quotation sudah disiapkan."
  };
}

function ensureSheetWithHeaders_(sheetName, headers) {
  const ss = Repository.ss();
  let sh = ss.getSheetByName(sheetName);

  if (!sh) {
    sh = ss.insertSheet(sheetName);
  }

  const existing = sh.getLastRow() >= 1
    ? sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), headers.length)).getValues()[0]
    : [];

  if (!existing.some(String)) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    return;
  }

  const currentHeaders = existing.map(h => String(h || "").trim()).filter(Boolean);
  headers.forEach(h => {
    if (currentHeaders.indexOf(h) === -1) {
      sh.getRange(1, sh.getLastColumn() + 1).setValue(h);
    }
  });
}

function syncQuotationMenuV4_() {
  if (!Repository.exists(CONFIG.SHEET.MENU)) return;

  const menuData = {
    menu_id: "MENU_QUOTATION",
    menu_code: "quotation",
    menu_name: "Quotation",
    parent_menu_id: "",
    page_key: "quotation",
    icon: "💰",
    sort_order: 3,
    is_active: 1,
    created_at: new Date(),
    updated_at: new Date()
  };

  const headers = Repository.headers(CONFIG.SHEET.MENU);
  Repository.upsert(CONFIG.SHEET.MENU, headers.indexOf("menu_id") !== -1 ? "menu_id" : headers[0], cleanByHeadersV4_(menuData, headers));
}

function cleanByHeadersV4_(data, headers) {
  const out = {};
  headers.forEach(h => {
    if (data[h] !== undefined) out[h] = data[h];
  });
  return out;
}
