/*************************************************
 * LOADER VALIDATION SERVICE - V6.8
 * Validasi pintar per target sheet loader.
 *************************************************/

class LoaderValidationService {
  static validate(targetSheet, rows, headers, user) {
    const rules = this.getRules_(targetSheet, headers);
    const errors = [];
    const warnings = [];
    const cleanRows = [];
    const seen = {};

    rows.forEach(function (row, index) {
      const rowNo = index + 2;
      const clean = {};
      const rowErrors = [];
      const rowWarnings = [];

      headers.forEach(function (h) {
        clean[h] = row[h] !== undefined ? String(row[h]).trim() : "";
      });

      (rules.required || []).forEach(function (field) {
        if (headers.indexOf(field) !== -1 && !clean[field]) {
          rowErrors.push("Kolom wajib kosong: " + field);
        }
      });

      if (rules.key && clean[rules.key]) {
        const keyVal = clean[rules.key];
        if (seen[keyVal]) {
          rowErrors.push("Duplicate key dalam file upload: " + rules.key + " = " + keyVal);
        } else {
          seen[keyVal] = true;
        }
      }

      (rules.email || []).forEach(function (field) {
        if (clean[field] && !LoaderValidationService.isEmail_(clean[field])) {
          rowErrors.push("Format email tidak valid: " + field + " = " + clean[field]);
        }
      });

      (rules.date || []).forEach(function (field) {
        if (clean[field] && !LoaderValidationService.isDate_(clean[field])) {
          rowErrors.push("Format tanggal tidak valid: " + field + " = " + clean[field] + ". Gunakan yyyy-mm-dd.");
        }
      });

      (rules.number || []).forEach(function (field) {
        if (clean[field] && !LoaderValidationService.isNumber_(clean[field])) {
          rowErrors.push("Format angka tidak valid: " + field + " = " + clean[field]);
        }
      });

      (rules.boolean || []).forEach(function (field) {
        if (clean[field] && ["0", "1", "TRUE", "FALSE", "true", "false"].indexOf(clean[field]) === -1) {
          rowErrors.push("Format boolean tidak valid: " + field + " = " + clean[field] + ". Gunakan 1/0.");
        }
      });

      Object.keys(rules.enum || {}).forEach(function (field) {
        if (clean[field]) {
          const allowed = rules.enum[field];
          if (allowed.indexOf(String(clean[field]).toUpperCase()) === -1) {
            rowErrors.push("Nilai tidak valid: " + field + " = " + clean[field] + ". Pilihan: " + allowed.join(", "));
          }
        }
      });

      (rules.foreignKeys || []).forEach(function (fk) {
        if (!clean[fk.field]) return;
        if (!LoaderValidationService.existsInSheet_(fk.sheet, fk.key, clean[fk.field])) {
          rowErrors.push("Relasi tidak ditemukan: " + fk.field + " = " + clean[fk.field] + " tidak ada di " + fk.sheet + "." + fk.key);
        }
      });

      const custom = LoaderValidationService.customValidate_(targetSheet, clean, rowNo);
      rowErrors.push.apply(rowErrors, custom.errors);
      rowWarnings.push.apply(rowWarnings, custom.warnings);

      if (rowErrors.length) {
        errors.push({ row: rowNo, key: rules.key ? clean[rules.key] : "", messages: rowErrors });
      }

      if (rowWarnings.length) {
        warnings.push({ row: rowNo, key: rules.key ? clean[rules.key] : "", messages: rowWarnings });
      }

      cleanRows.push(clean);
    });

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      rows: cleanRows,
      summary: {
        total_rows: rows.length,
        total_errors: errors.length,
        total_warnings: warnings.length
      }
    };
  }

  static getRules_(targetSheet, headers) {
    const common = {
      key: headers[0],
      required: [headers[0]],
      email: [],
      date: [],
      number: [],
      boolean: [],
      enum: {},
      foreignKeys: []
    };

    const map = {
      "01_M_USER": {
        key: "user_id",
        required: ["user_id", "username", "employee_id", "is_active"],
        boolean: ["is_active"],
        foreignKeys: [
          { field: "employee_id", sheet: CONFIG.SHEET.EMPLOYEE, key: "employee_id" }
        ]
      },
      "02_M_ROLE": {
        key: "role_id",
        required: ["role_id", "role_code", "role_name", "is_active"],
        boolean: ["is_active"]
      },
      "03_M_DEPARTMENT": {
        key: "department_id",
        required: ["department_id", "department_name", "is_active"],
        boolean: ["is_active"]
      },
      "04_M_EMPLOYEE": {
        key: "employee_id",
        required: ["employee_id", "nik", "full_name", "department_id", "email", "is_active"],
        email: ["email"],
        date: ["join_date", "created_at", "updated_at"],
        boolean: ["is_active"],
        enum: {
          employment_status: ["ACTIVE", "INACTIVE", "RESIGN", "PROBATION", "CONTRACT", "PERMANENT"]
        },
        foreignKeys: [
          { field: "department_id", sheet: CONFIG.SHEET.DEPARTMENT, key: "department_id" }
        ]
      },
      "05_M_USER_ROLE": {
        key: "user_role_id",
        required: ["user_role_id", "user_id", "role_id", "is_active"],
        boolean: ["is_active"],
        foreignKeys: [
          { field: "user_id", sheet: CONFIG.SHEET.USER, key: "user_id" },
          { field: "role_id", sheet: CONFIG.SHEET.ROLE, key: "role_id" }
        ]
      },
      "06_M_APPROVAL_MATRIX": {
        key: "matrix_id",
        required: ["matrix_id", "department_id", "role_id", "approval_level", "is_active"],
        number: ["approval_level", "min_amount", "max_amount"],
        boolean: ["is_active"],
        foreignKeys: [
          { field: "department_id", sheet: CONFIG.SHEET.DEPARTMENT, key: "department_id" },
          { field: "role_id", sheet: CONFIG.SHEET.ROLE, key: "role_id" }
        ]
      },
      "08_M_SLA": {
        key: "sla_id",
        required: ["sla_id", "document_type", "step_name", "sla_work_hour", "is_active"],
        number: ["sla_work_hour", "warning_before_work_hour"],
        boolean: ["is_active"]
      },
      "10_M_VENDOR": {
        key: "vendor_id",
        required: ["vendor_id", "vendor_name", "is_active"],
        email: ["email"],
        boolean: ["is_active"]
      },
      "10_T_FPB_HEADER": {
        key: "fpb_id",
        required: ["fpb_id", "fpb_no", "requester_id", "department_id", "status"],
        date: ["fpb_date", "created_at", "updated_at"],
        enum: { status: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "CANCELLED", "CLOSED"] },
        foreignKeys: [
          { field: "requester_id", sheet: CONFIG.SHEET.EMPLOYEE, key: "employee_id" },
          { field: "department_id", sheet: CONFIG.SHEET.DEPARTMENT, key: "department_id" }
        ]
      },
      "11_T_FPB_DETAIL": {
        key: "fpb_detail_id",
        required: ["fpb_detail_id", "fpb_id", "item_name", "qty", "uom"],
        number: ["qty", "estimated_price", "estimated_total"],
        foreignKeys: [
          { field: "fpb_id", sheet: CONFIG.SHEET.FPB_HEADER, key: "fpb_id" }
        ]
      },
      "15_T_QUOTATION_HEADER": {
        key: "quotation_id",
        required: ["quotation_id", "quotation_no", "fpb_id", "vendor_id", "quotation_amount", "status"],
        date: ["quotation_date", "valid_until", "created_at", "updated_at"],
        number: ["quotation_amount", "discount_amount", "tax_amount", "grand_total", "ranking"],
        boolean: ["is_selected"],
        enum: { status: ["DRAFT", "RECEIVED", "COMPARED", "SELECTED", "REJECTED", "CANCELLED"] },
        foreignKeys: [
          { field: "fpb_id", sheet: CONFIG.SHEET.FPB_HEADER, key: "fpb_id" },
          { field: "vendor_id", sheet: "10_M_VENDOR", key: "vendor_id" }
        ]
      },
      "16_T_QUOTATION_DETAIL": {
        key: "quotation_detail_id",
        required: ["quotation_detail_id", "quotation_id", "item_name", "qty", "uom", "unit_price"],
        number: ["qty", "unit_price", "discount_amount", "tax_amount", "line_total"],
        foreignKeys: [
          { field: "quotation_id", sheet: "15_T_QUOTATION_HEADER", key: "quotation_id" }
        ]
      },
      "20_T_PP_HEADER": {
        key: "pp_id",
        required: ["pp_id", "pp_no", "status"],
        date: ["pp_date", "created_at", "updated_at"],
        number: ["total_amount"],
        enum: { status: ["DRAFT", "FAT_VERIFY", "IA_VERIFY", "APPROVED", "REJECTED", "CANCELLED", "CLOSED"] }
      },
      "30_T_PR_HEADER": {
        key: "pr_id",
        required: ["pr_id", "pr_no", "status"],
        date: ["pr_date", "created_at", "updated_at"],
        enum: { status: ["DRAFT", "CREATED", "OPEN", "CLOSED", "CANCELLED"] }
      },
      "40_T_PO_HEADER": {
        key: "po_id",
        required: ["po_id", "po_no", "vendor_id", "status"],
        date: ["po_date", "created_at", "updated_at"],
        number: ["total_amount"],
        enum: { status: ["DRAFT", "CREATED", "OPEN", "DONE", "CLOSED", "CANCELLED"] },
        foreignKeys: [{ field: "vendor_id", sheet: "10_M_VENDOR", key: "vendor_id" }]
      },
      "50_T_RECEIVE_HEADER": {
        key: "receive_id",
        required: ["receive_id", "receive_no", "po_id", "status"],
        date: ["receive_date", "created_at", "updated_at"],
        enum: { status: ["DRAFT", "RECEIVED", "PARTIAL", "DONE", "CANCELLED"] },
        foreignKeys: [{ field: "po_id", sheet: CONFIG.SHEET.PO_HEADER, key: "po_id" }]
      },
      "60_T_INVOICE_HEADER": {
        key: "invoice_id",
        required: ["invoice_id", "invoice_no", "vendor_id", "status"],
        date: ["invoice_date", "created_at", "updated_at"],
        number: ["invoice_amount", "tax_amount", "total_amount"],
        enum: { status: ["DRAFT", "RECEIVED", "VERIFIED", "SPD_CREATED", "PAID", "CANCELLED"] },
        foreignKeys: [{ field: "vendor_id", sheet: "10_M_VENDOR", key: "vendor_id" }]
      },
      "70_T_PAYMENT_HEADER": {
        key: "payment_id",
        required: ["payment_id", "payment_no", "status"],
        date: ["payment_date", "created_at", "updated_at"],
        number: ["payment_amount"],
        enum: { status: ["DRAFT", "PROCESS", "PAID", "FAILED", "CANCELLED"] }
      }
    };

    const rule = map[targetSheet] || common;
    rule.required = (rule.required || []).filter(function (f) { return headers.indexOf(f) !== -1; });
    rule.email = (rule.email || []).filter(function (f) { return headers.indexOf(f) !== -1; });
    rule.date = (rule.date || []).filter(function (f) { return headers.indexOf(f) !== -1; });
    rule.number = (rule.number || []).filter(function (f) { return headers.indexOf(f) !== -1; });
    rule.boolean = (rule.boolean || []).filter(function (f) { return headers.indexOf(f) !== -1; });

    return Object.assign({}, common, rule);
  }

  static customValidate_(targetSheet, row, rowNo) {
    const errors = [];
    const warnings = [];

    if (targetSheet === "15_T_QUOTATION_HEADER") {
      const amount = this.toNumber_(row.quotation_amount || row.grand_total);
      if (amount <= 0) errors.push("Nilai quotation_amount/grand_total harus lebih dari 0.");
    }

    if (targetSheet === "16_T_QUOTATION_DETAIL") {
      const qty = this.toNumber_(row.qty);
      const price = this.toNumber_(row.unit_price);
      if (qty <= 0) errors.push("qty harus lebih dari 0.");
      if (price <= 0) errors.push("unit_price harus lebih dari 0.");
    }

    if (targetSheet === "11_T_FPB_DETAIL") {
      const qty = this.toNumber_(row.qty);
      if (qty <= 0) errors.push("qty harus lebih dari 0.");
    }

    if (targetSheet === "04_M_EMPLOYEE") {
      if (row.nik && row.nik.length < 5) warnings.push("NIK terlihat terlalu pendek.");
    }

    return { errors: errors, warnings: warnings };
  }

  static existsInSheet_(sheetName, key, value) {
    if (!sheetName || !key || !value) return true;
    if (!Repository.exists(sheetName)) return false;
    return !!Repository.findOne(sheetName, key, value);
  }

  static isEmail_(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
  }

  static isDate_(value) {
    const s = String(value || "").trim();
    if (!s) return true;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return !isNaN(new Date(s).getTime());
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) return !isNaN(new Date(s.replace(/\//g, "-")).getTime());
    return !isNaN(new Date(s).getTime());
  }

  static isNumber_(value) {
    const s = String(value || "").replace(/\./g, "").replace(",", ".");
    return s !== "" && !isNaN(Number(s));
  }

  static toNumber_(value) {
    const s = String(value || "0").replace(/\./g, "").replace(",", ".");
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }
}
