/**
 * =====================================================
 * SESSION SERVICE V2.1 - TOKEN PER BROWSER/PER DEVICE
 * Sheet: 94_T_USER_SESSION
 * Header wajib:
 * session_id | user_id | token | login_time | logout_time | expired_at | device_info | role_code | status
 * =====================================================
 */
class SessionService {

  static create(user, deviceInfo) {
      const now = new Date();
      const expiredAt = new Date(now.getTime() + 8 * 60 * 60 * 1000);

      const token =
        Utilities.getUuid() + "-" + new Date().getTime();

      const sessionId =
        Utilities.getUuid();

      Repository.getSheet(CONFIG.SHEET.USER_SESSION).appendRow([
        sessionId,
        user.user_id,
        token,
        now,
        "",
        expiredAt,
        deviceInfo || "WEB_BROWSER",
        user.role_code || user.role || "",
        "ACTIVE"
      ]);

      return {
        session_id: sessionId,
        token: token,
        user: user,
        expired_at: expiredAt.toISOString()
      };
    }

  static getSession(token) {
    if (!token) return null;

    const sessions = Repository.getAll(CONFIG.SHEET.USER_SESSION);
    const session = sessions.find(r =>
      String(r.token || "").trim() === String(token || "").trim() &&
      String(r.status || "").trim().toUpperCase() === "ACTIVE"
    );

    if (!session) return null;

    if (new Date(session.expired_at) < new Date()) {
      this.logout(token);
      return null;
    }

    return this.buildSessionContext_(session);
  }

  static buildSessionContext_(session) {
    const users = Repository.getAll(CONFIG.SHEET.USER);
    const employees = Repository.getAll(CONFIG.SHEET.EMPLOYEE);

    const user = users.find(r => same(r.user_id, session.user_id));
    if (!user) return null;

    const employee = employees.find(e =>
      same(e.employee_id, user.employee_id) ||
      same(e.nik, user.nik) ||
      same(e.email, user.email)
    ) || {};

    const roles = AuthService.getUserRoles(user.user_id);
    const primaryRole = AuthService.getPrimaryRole(roles);
    const redirectPage = AuthService.getRedirectPage(primaryRole);

    return {
      session_id: session.session_id,
      token: session.token,
      user_id: user.user_id,
      employee_id: user.employee_id,
      username: user.username,
      email: employee.email || user.email || user.username,
      nama: employee.full_name || user.nama,
      full_name: employee.full_name || user.nama,
      department_id: employee.department_id || user.department_id || user.dept_code,
      dept_code: employee.department_id || user.dept_code,
      role: primaryRole,
      role_code: primaryRole,
      roles: roles,
      redirectPage: redirectPage,
      expired_at: session.expired_at
    };
  }

  static isLoggedIn(token) {
    return !!this.getSession(token);
  }

  static logout(token) {
    if (!token) return false;

    const sh = Repository.getSheet(CONFIG.SHEET.USER_SESSION);
    const data = sh.getDataRange().getValues();
    if (data.length < 2) return false;

    const headers = data[0];
    const tokenCol = headers.indexOf("token");
    const logoutCol = headers.indexOf("logout_time");
    const statusCol = headers.indexOf("status");

    if (tokenCol === -1) throw new Error("Kolom token tidak ditemukan di " + CONFIG.SHEET.USER_SESSION);

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][tokenCol] || "").trim() === String(token || "").trim()) {
        if (logoutCol > -1) sh.getRange(i + 1, logoutCol + 1).setValue(new Date());
        if (statusCol > -1) sh.getRange(i + 1, statusCol + 1).setValue("LOGOUT");
        return true;
      }
    }

    return false;
  }
}


// fungsi ini mempertahankan validasi token yang lebih ketat dengan memeriksa status sesi dan waktu expired berdasarkan data di Google Spreadsheet. Pastikan struktur tabel "94_T_USER_SESSION" sesuai dengan yang dijelaskan di komentar header fungsi ini untuk memastikan validasi berjalan dengan benar.
function validateSessionToken(token) {
  // 1. Validasi Awal
  if (!token || String(token).trim() === "") {
    return { success: false, message: "Token kosong." };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("94_T_USER_SESSION"); 
    
    if (!sheet) {
      return { success: false, message: "Tabel 94_T_USER_SESSION tidak ditemukan." };
    }

    const data = sheet.getDataRange().getValues();
    const tokenStr = String(token).trim();

    // 2. Looping data (Mulai baris indeks 1 untuk melewati nama kolom/header)
    for (let i = 1; i < data.length; i++) {
      
      // Sesuai struktur tabel Anda:
      // Indeks 0 = session_id, Indeks 1 = user_id, Indeks 2 = token (Kolom C)
      const dbToken = String(data[i][2]).trim(); 
      const dbStatus = String(data[i][8]).trim().toUpperCase(); // Indeks 8 = status (Kolom I)

      // 3. Cocokkan Token
      if (dbToken === tokenStr) {
        
        // A. Cek Status Sesi (Harus ACTIVE)
        if (dbStatus !== "ACTIVE") {
          return { success: false, message: "Sesi sudah tidak aktif atau Anda telah logout." };
        }

        // B. Cek Waktu Expired Berdasarkan Database (Indeks 5 = expired_at / Kolom F)
        const dbExpiredAt = data[i][5];
        if (dbExpiredAt) {
          const expireTime = new Date(dbExpiredAt).getTime();
          const currentTime = new Date().getTime();
          
          if (currentTime > expireTime) {
            return { success: false, message: "Sesi di database telah kedaluwarsa." };
          }
        }

        // JIKA LOLOS SEMUA VERIFIKASI: Kirim respon sukses beserta data user pendukung
        return { 
          success: true, 
          message: "Sesi valid.",
          user: {
            userId: data[i][1],      // user_id
            roleCode: data[i][7]     // role_code (Kolom H)
          }
        };
      }
    }

    // Jika setelah diperiksa sampai baris terakhir tidak ketemu
    return { success: false, message: "Token tidak terdaftar atau telah dihapus dari server." };

  } catch (error) {
    Logger.log("Error validateSessionToken: " + error.toString());
    return { success: false, message: "Terjadi kesalahan internal server saat validasi." };
  }
}

function getCurrentUser(token) {
  return SessionService.getSession(token);
}
