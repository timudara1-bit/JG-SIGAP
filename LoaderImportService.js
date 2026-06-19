/*************************************************
 * LOADER IMPORT SERVICE - HOTFIX V6.7
 * Perbaikan:
 * - Auto detect delimiter CSV: koma (,), titik koma (;), atau tab
 * - Template CSV dibuat dengan delimiter titik koma (;) agar cocok Excel Indonesia
 * - Validasi header tidak lagi gagal karena header terbaca sebagai 1 kolom panjang
 *************************************************/

class LoaderImportService {
  static getTemplate(payload, user) {
    const loader = this.getLoader_(payload.loader_id);
    if (!loader) return { success: false, message: "Loader tidak ditemukan: " + payload.loader_id };

    const targetSheet = loader.sheet_target || loader.target_sheet;
    if (!targetSheet) return { success: false, message: "Target sheet belum diatur pada loader." };

    if (!Repository.exists(targetSheet)) {
      return { success: false, message: "Target sheet tidak ditemukan: " + targetSheet };
    }

    const headers = Repository.headers(targetSheet);
    if (!headers.length) return { success: false, message: "Header target sheet kosong: " + targetSheet };

    const sample = this.sampleRow_(headers);

    // Pakai delimiter ; agar saat dibuka Excel Indonesia tidak pecah format.
    const delimiter = ";";
    const csv = this.toDelimitedText_([headers, sample], delimiter);

    return {
      success: true,
      data: {
        loader_id: loader.loader_id,
        module_name: loader.module_name || loader.loader_name,
        target_sheet: targetSheet,
        headers: headers,
        delimiter: delimiter,
        file_name: (loader.template_sheet || loader.template_name || targetSheet || "TEMPLATE") + ".csv",
        mime_type: "text/csv",
        csv: csv
      }
    };
  }

  static validateFile(payload, user) {
    const loader = this.getLoader_(payload.loader_id);
    if (!loader) return { success: false, message: "Loader tidak ditemukan: " + payload.loader_id };

    const targetSheet = loader.sheet_target || loader.target_sheet;
    if (!Repository.exists(targetSheet)) {
      return { success: false, message: "Target sheet tidak ditemukan: " + targetSheet };
    }

    const expectedHeaders = Repository.headers(targetSheet).map(function (h) {
      return String(h || "").trim();
    });

    const fileName = String(payload.fileName || payload.file_name || "");
    const dataUrl = String(payload.dataUrl || payload.data_url || "");

    if (!dataUrl || dataUrl.indexOf("base64,") === -1) {
      return { success: false, message: "File tidak valid." };
    }

    const ext = fileName.split(".").pop().toLowerCase();
    if (ext !== "csv") {
      return {
        success: false,
        message: "Untuk tahap ini validasi otomatis mendukung CSV. Simpan file Excel sebagai CSV UTF-8 lalu upload kembali."
      };
    }

    const bytes = Utilities.base64Decode(dataUrl.split("base64,")[1]);
    let text = Utilities.newBlob(bytes).getDataAsString("UTF-8");

    // Hilangkan BOM UTF-8 jika ada
    text = text.replace(/^\uFEFF/, "");

    const delimiter = this.detectDelimiter_(text);
    const csvRows = Utilities.parseCsv(text, delimiter);

    if (!csvRows.length) {
      return { success: false, message: "File CSV kosong." };
    }

    const actualHeaders = csvRows[0].map(function (h) {
      return String(h || "").replace(/^\uFEFF/, "").trim();
    });

    const requiredMissing = expectedHeaders.filter(function (h) {
      return actualHeaders.indexOf(h) === -1;
    });

    const extraHeaders = actualHeaders.filter(function (h) {
      return expectedHeaders.indexOf(h) === -1;
    });

    const dataRows = csvRows.slice(1).filter(function (row) {
      return row.some(function (v) { return String(v || "").trim() !== ""; });
    });

    const parsedRows = dataRows.map(function (row) {
      return LoaderImportService.rowToObject_(actualHeaders, expectedHeaders, row);
    });

    const headerValid = requiredMissing.length === 0;

    let smartValidation = {
      valid: true,
      errors: [],
      warnings: [],
      rows: parsedRows,
      summary: {
        total_rows: parsedRows.length,
        total_errors: 0,
        total_warnings: 0
      }
    };

    if (headerValid) {
      smartValidation = LoaderValidationService.validate(targetSheet, parsedRows, expectedHeaders, user);
    }

    const valid = headerValid && smartValidation.valid;
    const preview = smartValidation.rows.slice(0, 10);

    return {
      success: true,
      data: {
        valid: valid,
        header_valid: headerValid,
        delimiter: delimiter === "	" ? "TAB" : delimiter,
        loader_id: loader.loader_id,
        module_name: loader.module_name || loader.loader_name,
        target_sheet: targetSheet,
        expected_headers: expectedHeaders,
        actual_headers: actualHeaders,
        missing_headers: requiredMissing,
        extra_headers: extraHeaders,
        total_rows: dataRows.length,
        preview: preview,
        rows: valid ? smartValidation.rows : [],
        validation_errors: smartValidation.errors || [],
        validation_warnings: smartValidation.warnings || [],
        validation_summary: smartValidation.summary || {}
      },
      message: valid ? "Validasi berhasil. File siap diimport." : "Validasi gagal. Periksa header atau isi data."
    };
  }

  static importData(payload, user) {
    const loader = this.getLoader_(payload.loader_id);
    if (!loader) return { success: false, message: "Loader tidak ditemukan: " + payload.loader_id };

    const targetSheet = loader.sheet_target || loader.target_sheet;
    if (!Repository.exists(targetSheet)) {
      return { success: false, message: "Target sheet tidak ditemukan: " + targetSheet };
    }

    const headers = Repository.headers(targetSheet);
    const rows = payload.rows || [];

    if (!rows.length) {
      return { success: false, message: "Tidak ada data valid untuk diimport." };
    }

    let inserted = 0;
    let updated = 0;
    const key = payload.key || headers[0];

    rows.forEach(function (r) {
      const clean = LoaderImportService.cleanByHeaders_(r, headers);

      if (headers.indexOf("updated_at") !== -1) clean.updated_at = new Date();
      if (headers.indexOf("updated_by") !== -1) clean.updated_by = user.user_id;

      if (!clean[key]) {
        if (headers.indexOf("created_at") !== -1) clean.created_at = new Date();
        if (headers.indexOf("created_by") !== -1) clean.created_by = user.user_id;
        Repository.insert(targetSheet, clean);
        inserted++;
      } else {
        const exist = Repository.findOne(targetSheet, key, clean[key]);
        if (exist) {
          Repository.upsert(targetSheet, key, clean);
          updated++;
        } else {
          if (headers.indexOf("created_at") !== -1) clean.created_at = new Date();
          if (headers.indexOf("created_by") !== -1) clean.created_by = user.user_id;
          Repository.insert(targetSheet, clean);
          inserted++;
        }
      }
    });

    AuditService.log(user, "LOADER_IMPORT", "LOADER", loader.loader_id, "", {
      target_sheet: targetSheet,
      inserted: inserted,
      updated: updated
    }, "Import data loader");

    return {
      success: true,
      message: "Import selesai. Insert: " + inserted + ", Update: " + updated,
      data: {
        target_sheet: targetSheet,
        inserted: inserted,
        updated: updated
      }
    };
  }

  static detectDelimiter_(text) {
    const firstLine = String(text || "").split(/\r?\n/)[0] || "";

    const candidates = [
      { delimiter: ";", count: (firstLine.match(/;/g) || []).length },
      { delimiter: ",", count: (firstLine.match(/,/g) || []).length },
      { delimiter: "\t", count: (firstLine.match(/\t/g) || []).length }
    ];

    candidates.sort(function (a, b) {
      return b.count - a.count;
    });

    return candidates[0].count > 0 ? candidates[0].delimiter : ",";
  }

  static rowToObject_(actualHeaders, expectedHeaders, row) {
    const obj = {};
    actualHeaders.forEach(function (h, i) {
      if (expectedHeaders.indexOf(h) !== -1) obj[h] = row[i] || "";
    });
    return obj;
  }

  static getLoader_(loaderId) {
    const rows = LoaderConfigService.getConfig({ filters: {} }, { user_id: "SYSTEM" }).data || [];
    return rows.find(function (r) {
      return same(r.loader_id, loaderId);
    });
  }

  static cleanByHeaders_(data, headers) {
    const out = {};
    headers.forEach(function (h) {
      if (data[h] !== undefined) out[h] = data[h];
    });
    return out;
  }

  static sampleRow_(headers) {
    return headers.map(function (h) {
      const key = String(h || "").toLowerCase();
      if (key.indexOf("_id") !== -1) return "AUTO_OR_ID";
      if (key.indexOf("_no") !== -1) return "AUTO_OR_NO";
      if (key.indexOf("date") !== -1 || key.indexOf("_at") !== -1 || key.indexOf("time") !== -1) return "2026-06-18";
      if (key.indexOf("amount") !== -1 || key.indexOf("price") !== -1 || key.indexOf("qty") !== -1 || key.indexOf("total") !== -1) return "0";
      if (key.indexOf("is_active") !== -1) return "1";
      if (key.indexOf("status") !== -1) return "DRAFT";
      return "";
    });
  }

  static toDelimitedText_(rows, delimiter) {
    delimiter = delimiter || ";";
    return rows.map(function (row) {
      return row.map(function (cell) {
        const s = String(cell == null ? "" : cell);
        if (s.indexOf(delimiter) !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1 || s.indexOf("\r") !== -1) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      }).join(delimiter);
    }).join("\n");
  }
}
