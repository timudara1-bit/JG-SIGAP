class Repository {
  static ss() {
    const id = String(CONFIG.APP.SPREADSHEET_ID || "").trim();
    if (id && id !== "ISI_DENGAN_SPREADSHEET_ID_DATABASE_REV1") return SpreadsheetApp.openById(id);
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
    throw new Error("SPREADSHEET_ID belum diisi dan active spreadsheet tidak ditemukan.");
  }

  static sheet(sheetName) {
    const sh = this.ss().getSheetByName(sheetName);
    if (!sh) throw new Error("Sheet tidak ditemukan: " + sheetName);
    return sh;
  }

  static exists(sheetName) {
    return !!this.ss().getSheetByName(sheetName);
  }

  static headers(sheetName) {
    const sh = this.sheet(sheetName);
    const lastCol = sh.getLastColumn();
    if (!lastCol) return [];
    return sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim()).filter(Boolean);
  }

  static getAll(sheetName) {
    const sh = this.sheet(sheetName);
    const values = sh.getDataRange().getValues();
    if (values.length < 2) return [];
    const headers = values[0].map(h => String(h || "").trim());
    return values.slice(1)
      .filter(row => row.some(v => v !== "" && v !== null))
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => { if (h) obj[h] = row[i]; });
        return obj;
      });
  }

  static safeGetAll(sheetName) {
    try {
      if (!this.exists(sheetName)) return [];
      return this.getAll(sheetName);
    } catch (err) {
      Logger.log("safeGetAll " + sheetName + ": " + err.message);
      return [];
    }
  }

  static findOne(sheetName, key, value) {
    return this.safeGetAll(sheetName).find(r => same(r[key], value)) || null;
  }

  static findBy(sheetName, key, value) {
    return this.safeGetAll(sheetName).filter(r => same(r[key], value));
  }

  static insert(sheetName, data) {
    const sh = this.sheet(sheetName);
    const headers = this.headers(sheetName);
    const row = headers.map(h => data[h] !== undefined ? data[h] : "");
    sh.appendRow(row);
    return data;
  }

  static update(sheetName, keyName, keyValue, changes) {
    const sh = this.sheet(sheetName);
    const values = sh.getDataRange().getValues();
    if (values.length < 2) return false;
    const headers = values[0].map(h => String(h || "").trim());
    const keyIdx = headers.indexOf(keyName);
    if (keyIdx === -1) throw new Error("Kolom " + keyName + " tidak ada di " + sheetName);
    for (let i = 1; i < values.length; i++) {
      if (same(values[i][keyIdx], keyValue)) {
        Object.keys(changes).forEach(field => {
          const idx = headers.indexOf(field);
          if (idx !== -1) sh.getRange(i + 1, idx + 1).setValue(changes[field]);
        });
        return true;
      }
    }
    return false;
  }

  static softDelete(sheetName, keyName, keyValue) {
    return this.update(sheetName, keyName, keyValue, { is_active: 0, deleted_at: new Date(), updated_at: new Date() });
  }

  static upsert(sheetName, keyName, data) {
    if (data[keyName] && this.findOne(sheetName, keyName, data[keyName])) {
      this.update(sheetName, keyName, data[keyName], data);
      return data;
    }
    return this.insert(sheetName, data);
  }
}

function same(a, b) {
  return String(a === undefined || a === null ? "" : a).trim().toLowerCase() ===
         String(b === undefined || b === null ? "" : b).trim().toLowerCase();
}

function isActiveValue(v) {
  const s = String(v).trim().toLowerCase();
  return v === true || v === 1 || s === "1" || s === "true" || s === "aktif" || s === "active";
}

function now_() { return new Date(); }

function uid(prefix) {
  return prefix + Utilities.formatDate(new Date(), CONFIG.APP.TIMEZONE, "yyyyMMddHHmmss") + "-" + Utilities.getUuid().slice(0, 6).toUpperCase();
}
