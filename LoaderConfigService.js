/*************************************************
 * LOADER CONFIG SERVICE - HOTFIX V6.4
 * Menampilkan dan sinkronisasi config loader per segment.
 *************************************************/

function syncLoaderConfig() {
  return LoaderConfigService.syncDefault();
}

function syncLoaderConfigV64() {
  return LoaderConfigService.syncDefault();
}

class LoaderConfigService {
  static getConfig(payload, user) {
    if (!Repository.exists(CONFIG.SHEET.LOADER_CONFIG)) {
      return {
        success: false,
        message: "Sheet loader config tidak ditemukan: " + CONFIG.SHEET.LOADER_CONFIG
      };
    }

    let rows = Repository.safeGetAll(CONFIG.SHEET.LOADER_CONFIG);

    if (!rows.length) {
      rows = this.defaultConfig();
    }

    const search = String((payload && payload.filters && payload.filters.search) || "").toLowerCase();
    if (search) {
      rows = rows.filter(function (r) {
        return JSON.stringify(r).toLowerCase().indexOf(search) !== -1;
      });
    }

    const normalized = rows.map(function (r) {
      return {
        loader_id: r.loader_id || r.id || "",
        loader_group: r.loader_group || r.group_name || r.category || "SYSTEM",
        group_name: r.group_name || r.loader_group || r.category || "SYSTEM",
        module_name: r.module_name || r.loader_name || r.module || "",
        loader_name: r.loader_name || r.module_name || r.module || "",
        sheet_target: r.sheet_target || r.target_sheet || "",
        target_sheet: r.target_sheet || r.sheet_target || "",
        template_sheet: r.template_sheet || r.template_name || "",
        template_name: r.template_name || r.template_sheet || "",
        description: r.description || r.remarks || "",
        allow_insert: r.allow_insert === "" ? 1 : r.allow_insert,
        allow_update: r.allow_update === "" ? 1 : r.allow_update,
        require_validation: r.require_validation === "" ? 1 : r.require_validation,
        header_row: r.header_row || 1,
        start_row: r.start_row || 2,
        is_active: String(r.is_active) === "0" ? 0 : 1
      };
    });

    return {
      success: true,
      data: normalized,
      total: normalized.length,
      groups: this.groupSummary_(normalized)
    };
  }

  static syncDefault() {
    if (!Repository.exists(CONFIG.SHEET.LOADER_CONFIG)) {
      return {
        success: false,
        message: "Sheet loader config tidak ditemukan: " + CONFIG.SHEET.LOADER_CONFIG
      };
    }

    this.ensureColumns_();

    const headers = Repository.headers(CONFIG.SHEET.LOADER_CONFIG);
    const key = headers.indexOf("loader_id") !== -1 ? "loader_id" : headers[0];
    const rows = this.defaultConfig();

    rows.forEach(function (r) {
      Repository.upsert(CONFIG.SHEET.LOADER_CONFIG, key, LoaderConfigService.cleanByHeaders_(r, headers));
    });

    return {
      success: true,
      message: "Config loader per segment berhasil disinkronkan.",
      total: rows.length
    };
  }

  static defaultConfig() {
    const now = new Date();
    const list = [
      ["LOD001", "PENGADAAN", "FPB Header", "10_T_FPB_HEADER", "TPL_FPB_HEADER", "Import header pengajuan FPB"],
      ["LOD002", "PENGADAAN", "FPB Detail", "11_T_FPB_DETAIL", "TPL_FPB_DETAIL", "Import detail barang/jasa FPB"],
      ["LOD003", "PENGADAAN", "Quotation Header", "15_T_QUOTATION_HEADER", "TPL_QUOTATION_HEADER", "Import quotation vendor per FPB"],
      ["LOD004", "PENGADAAN", "Quotation Detail", "16_T_QUOTATION_DETAIL", "TPL_QUOTATION_DETAIL", "Import detail item quotation"],
      ["LOD005", "PENGADAAN", "Underlying Header", "12_T_UNDERLYING_HEADER", "TPL_UNDERLYING_HEADER", "Import underlying vendor terpilih"],
      ["LOD006", "PENGADAAN", "Vendor Comparison", "14_T_VENDOR_COMPARISON", "TPL_VENDOR_COMPARISON", "Import pembanding vendor"],

      ["LOD007", "PROSES", "PP Header", "20_T_PP_HEADER", "TPL_PP_HEADER", "Import Payment Plan"],
      ["LOD008", "PROSES", "PP Detail", "21_T_PP_DETAIL", "TPL_PP_DETAIL", "Import detail Payment Plan"],
      ["LOD009", "PROSES", "PR Header", "30_T_PR_HEADER", "TPL_PR_HEADER", "Import Purchase Request"],
      ["LOD010", "PROSES", "PR Detail", "31_T_PR_DETAIL", "TPL_PR_DETAIL", "Import detail Purchase Request"],
      ["LOD011", "PROSES", "PO Header", "40_T_PO_HEADER", "TPL_PO_HEADER", "Import Purchase Order"],
      ["LOD012", "PROSES", "PO Detail", "41_T_PO_DETAIL", "TPL_PO_DETAIL", "Import detail Purchase Order"],
      ["LOD013", "PROSES", "Receive Header", "50_T_RECEIVE_HEADER", "TPL_RECEIVE_HEADER", "Import receive barang/jasa"],
      ["LOD014", "PROSES", "Receive Detail", "51_T_RECEIVE_DETAIL", "TPL_RECEIVE_DETAIL", "Import detail receive"],
      ["LOD015", "PROSES", "Invoice Header", "60_T_INVOICE_HEADER", "TPL_INVOICE_HEADER", "Import invoice vendor"],
      ["LOD016", "PROSES", "Invoice Detail", "61_T_INVOICE_DETAIL", "TPL_INVOICE_DETAIL", "Import detail invoice"],
      ["LOD017", "PROSES", "SPD Header", "62_T_SPD_HEADER", "TPL_SPD_HEADER", "Import SPD"],
      ["LOD018", "PROSES", "SPD Detail", "63_T_SPD_DETAIL", "TPL_SPD_DETAIL", "Import detail SPD"],
      ["LOD019", "PROSES", "Payment Header", "70_T_PAYMENT_HEADER", "TPL_PAYMENT_HEADER", "Import payment"],
      ["LOD020", "PROSES", "Payment Detail", "71_T_PAYMENT_DETAIL", "TPL_PAYMENT_DETAIL", "Import detail payment"],
      ["LOD021", "PROSES", "Document Attachment", "78_T_DOCUMENT_ATTACHMENT", "TPL_DOCUMENT_ATTACHMENT", "Import lampiran dokumen"],

      ["LOD022", "MASTER DATA", "User", "01_M_USER", "TPL_USER", "Import user"],
      ["LOD023", "MASTER DATA", "Role", "02_M_ROLE", "TPL_ROLE", "Import role"],
      ["LOD024", "MASTER DATA", "Department", "03_M_DEPARTMENT", "TPL_DEPARTMENT", "Import department"],
      ["LOD025", "MASTER DATA", "Employee", "04_M_EMPLOYEE", "TPL_EMPLOYEE", "Import karyawan"],
      ["LOD026", "MASTER DATA", "User Role", "05_M_USER_ROLE", "TPL_USER_ROLE", "Import role user"],
      ["LOD027", "MASTER DATA", "Approval Matrix", "06_M_APPROVAL_MATRIX", "TPL_APPROVAL_MATRIX", "Import approval matrix"],
      ["LOD028", "MASTER DATA", "Workflow Step", "07_M_WORKFLOW_STEP", "TPL_WORKFLOW_STEP", "Import workflow step"],
      ["LOD029", "MASTER DATA", "SLA", "08_M_SLA", "TPL_SLA", "Import setting SLA"],
      ["LOD030", "MASTER DATA", "Vendor", "10_M_VENDOR", "TPL_VENDOR", "Import vendor"],
      ["LOD031", "MASTER DATA", "Company", "11_M_COMPANY", "TPL_COMPANY", "Import company"],
      ["LOD032", "MASTER DATA", "Site", "12_M_SITE", "TPL_SITE", "Import site"],
      ["LOD033", "MASTER DATA", "Cost Center", "13_M_COST_CENTER", "TPL_COST_CENTER", "Import cost center"],
      ["LOD034", "MASTER DATA", "Item Category", "14_M_ITEM_CATEGORY", "TPL_ITEM_CATEGORY", "Import kategori item"],
      ["LOD035", "MASTER DATA", "Menu", "15_M_MENU", "TPL_MENU", "Import menu"],
      ["LOD036", "MASTER DATA", "Role Menu", "16_M_ROLE_MENU", "TPL_ROLE_MENU", "Import akses menu role"],
      ["LOD037", "MASTER DATA", "Location", "22_M_LOCATION", "TPL_LOCATION", "Import lokasi"],

      ["LOD038", "MONITORING", "Workflow History", "81_T_WORKFLOW_HISTORY", "TPL_WORKFLOW_HISTORY", "Import history workflow"],
      ["LOD039", "MONITORING", "Document Link", "82_T_DOCUMENT_LINK", "TPL_DOCUMENT_LINK", "Import link antar dokumen"],
      ["LOD040", "MONITORING", "Document Status", "83_T_DOCUMENT_STATUS", "TPL_DOCUMENT_STATUS", "Import status dokumen"],
      ["LOD041", "MONITORING", "SLA Snapshot", "85_T_SLA_SNAPSHOT", "TPL_SLA_SNAPSHOT", "Import snapshot SLA"],
      ["LOD042", "MONITORING", "Warning Log", "86_T_WARNING_LOG", "TPL_WARNING_LOG", "Import warning overdue"],
      ["LOD043", "MONITORING", "Bottleneck Snapshot", "87_T_BOTTLENECK_SNAPSHOT", "TPL_BOTTLENECK", "Import bottleneck"],
      ["LOD044", "MONITORING", "User Task", "88_T_USER_TASK", "TPL_USER_TASK", "Import task user"],
      ["LOD045", "MONITORING", "Task History", "89_T_TASK_HISTORY", "TPL_TASK_HISTORY", "Import history task"],

      ["LOD046", "SYSTEM", "Config", "00_M_CONFIG", "TPL_CONFIG", "Import config"],
      ["LOD047", "SYSTEM", "Numbering", "09_M_NUMBERING", "TPL_NUMBERING", "Import numbering"],
      ["LOD048", "SYSTEM", "Priority", "17_M_PRIORITY", "TPL_PRIORITY", "Import priority"],
      ["LOD049", "SYSTEM", "Work Calendar", "18_M_WORK_CALENDAR", "TPL_WORK_CALENDAR", "Import kalender kerja"],
      ["LOD050", "SYSTEM", "Holiday Calendar", "19_M_HOLIDAY_CALENDAR", "TPL_HOLIDAY_CALENDAR", "Import hari libur"],
      ["LOD051", "SYSTEM", "Notification Template", "20_M_NOTIFICATION_TEMPLATE", "TPL_NOTIFICATION_TEMPLATE", "Import template notifikasi"],
      ["LOD052", "SYSTEM", "Escalation Rule", "21_M_ESCALATION_RULE", "TPL_ESCALATION_RULE", "Import rule eskalasi"]
    ];

    return list.map(function (r) {
      return {
        loader_id: r[0],
        loader_group: r[1],
        group_name: r[1],
        module_name: r[2],
        loader_name: r[2],
        sheet_target: r[3],
        target_sheet: r[3],
        template_sheet: r[4],
        template_name: r[4],
        description: r[5],
        allow_insert: 1,
        allow_update: 1,
        allow_delete: 0,
        require_validation: 1,
        header_row: 1,
        start_row: 2,
        is_active: 1,
        created_at: now,
        updated_at: now
      };
    });
  }

  static ensureColumns_() {
    const required = [
      "loader_id", "loader_group", "group_name", "module_name", "loader_name",
      "sheet_target", "target_sheet", "template_sheet", "template_name",
      "description", "allow_insert", "allow_update", "allow_delete",
      "require_validation", "header_row", "start_row", "is_active",
      "created_at", "updated_at"
    ];

    const sh = Repository.sheet(CONFIG.SHEET.LOADER_CONFIG);
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
      return String(h || "").trim();
    });

    required.forEach(function (h) {
      if (headers.indexOf(h) === -1) {
        sh.getRange(1, sh.getLastColumn() + 1).setValue(h);
      }
    });
  }

  static groupSummary_(rows) {
    const map = {};
    rows.forEach(function (r) {
      const group = r.loader_group || "SYSTEM";
      map[group] = (map[group] || 0) + 1;
    });
    return Object.keys(map).map(function (k) {
      return { group: k, total: map[k] };
    });
  }

  static cleanByHeaders_(data, headers) {
    const out = {};
    headers.forEach(function (h) {
      if (data[h] !== undefined) out[h] = data[h];
    });
    return out;
  }
}
