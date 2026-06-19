/*************************************************
 * USER MANAGEMENT SERVICE - HOTFIX V7.0
 * Perbaikan:
 * - Management User benar-benar bind ke DB
 * - Toleran nama kolom berbeda: full_name/name/nama_lengkap, username/email
 * - List user dari 01_M_USER + employee + user_role + role
 *************************************************/
class UserManagementService {
  static debugCounts(payload, user) {
    return {
      success: true,
      data: {
        user_sheet: CONFIG.SHEET.USER,
        user_rows: Repository.safeGetAll(CONFIG.SHEET.USER).length,
        employee_sheet: CONFIG.SHEET.EMPLOYEE,
        employee_rows: Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE).length,
        role_sheet: CONFIG.SHEET.ROLE,
        role_rows: Repository.safeGetAll(CONFIG.SHEET.ROLE).length,
        user_role_sheet: CONFIG.SHEET.USER_ROLE,
        user_role_rows: Repository.safeGetAll(CONFIG.SHEET.USER_ROLE).length
      }
    };
  }

  static getInitData(payload, user) {
    return {
      success: true,
      data: {
        roles: this.getRoles_(),
        users: this.listUsers(payload || {}, user).data || [],
        employees_total: Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE).length
      }
    };
  }

  static searchEmployees(payload, user) {
    const q = String(payload.q || payload.search || "").toLowerCase().trim();
    const limit = Number(payload.limit || 20);
    let rows = Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE);

    rows = rows.filter(function(r) {
      const activeValue = String(r.is_active !== undefined ? r.is_active : r.aktif || "").toUpperCase();
      const active = activeValue === "" || activeValue === "1" || activeValue === "TRUE" || activeValue === "AKTIF" || activeValue === "ACTIVE";
      if (!active) return false;

      if (!q) return true;

      const hay = [
        r.employee_id, r.emp_id, r.nik, r.employee_no, r.no_karyawan,
        r.full_name, r.name, r.nama_lengkap, r.nama,
        r.email, r.department_id, r.dept_id, r.department, r.position_id, r.jabatan
      ].join(" ").toLowerCase();

      return hay.indexOf(q) !== -1;
    });

    rows = rows.slice(0, limit).map(function(r) {
      return UserManagementService.normalizeEmployee_(r);
    });

    return { success: true, data: rows, total: rows.length };
  }

  static listUsers(payload, user) {
    const users = Repository.safeGetAll(CONFIG.SHEET.USER);
    const userRoles = Repository.safeGetAll(CONFIG.SHEET.USER_ROLE);
    const roles = Repository.safeGetAll(CONFIG.SHEET.ROLE);
    const employees = Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE);

    const roleMap = {};
    roles.forEach(function(r) {
      roleMap[r.role_id] = r.role_name || r.role_code || r.name || r.role_id;
    });

    const empMap = {};
    employees.forEach(function(e) {
      const n = UserManagementService.normalizeEmployee_(e);
      if (n.employee_id) empMap[n.employee_id] = n;
    });

    let rows = users.map(function(u) {
      const employeeId = u.employee_id || u.emp_id || "";
      const emp = empMap[employeeId] || {};
      const userId = u.user_id || u.id || "";

      const assigned = userRoles
        .filter(function(ur) {
          const activeValue = String(ur.is_active !== undefined ? ur.is_active : ur.aktif || "").toUpperCase();
          const active = activeValue === "" || activeValue === "1" || activeValue === "TRUE" || activeValue === "AKTIF" || activeValue === "ACTIVE";
          return same(ur.user_id, userId) && active;
        })
        .map(function(ur) {
          return roleMap[ur.role_id] || ur.role_code || ur.role_id || "";
        })
        .filter(Boolean);

      return {
        user_id: userId,
        username: u.username || u.email || emp.email || "",
        employee_id: employeeId,
        nik: emp.nik || u.nik || "",
        full_name: emp.full_name || u.full_name || u.name || "",
        email: emp.email || u.email || u.username || "",
        department_id: emp.department_id || u.department_id || u.dept_id || "",
        roles: assigned.join(", "),
        is_active: u.is_active !== undefined ? u.is_active : u.aktif
      };
    });

    const q = String(payload.search || "").toLowerCase().trim();
    if (q) rows = rows.filter(function(r) { return JSON.stringify(r).toLowerCase().indexOf(q) !== -1; });

    return { success: true, data: rows, total: rows.length };
  }

  static createUser(payload, user) {
    const employeeId = String(payload.employee_id || "").trim();
    const roleId = String(payload.role_id || "").trim();
    const password = String(payload.password || "123456").trim();
    const isActive = payload.is_active === undefined ? 1 : payload.is_active;

    if (!employeeId) return { success: false, message: "Employee belum dipilih." };
    if (!roleId) return { success: false, message: "Role belum dipilih." };

    const empRaw = Repository.findOne(CONFIG.SHEET.EMPLOYEE, "employee_id", employeeId);
    if (!empRaw) return { success: false, message: "Karyawan tidak ditemukan di 04_M_EMPLOYEE." };

    const emp = this.normalizeEmployee_(empRaw);
    const username = String(emp.email || "").trim();

    if (!username) return { success: false, message: "Email karyawan kosong. Username harus memakai email dari data employee." };
    if (Repository.findOne(CONFIG.SHEET.USER, "employee_id", employeeId)) return { success: false, message: "Karyawan ini sudah memiliki akun user." };
    if (Repository.findOne(CONFIG.SHEET.USER, "username", username)) return { success: false, message: "Email ini sudah terdaftar sebagai username." };

    const role = Repository.findOne(CONFIG.SHEET.ROLE, "role_id", roleId);
    if (!role) return { success: false, message: "Role tidak ditemukan di 02_M_ROLE." };

    const userId = this.nextId_(CONFIG.SHEET.USER, "user_id", "USR", 3);
    const userRoleId = this.nextId_(CONFIG.SHEET.USER_ROLE, "user_role_id", "UR", 4);
    const salt = SecurityService.generateSalt ? SecurityService.generateSalt() : Utilities.getUuid();
    const hash = SecurityService.hashPassword ? SecurityService.hashPassword(password, salt) : this.hashPassword_(password, salt);
    const now = new Date();

    Repository.insert(CONFIG.SHEET.USER, this.cleanByHeaders_({
      user_id: userId,
      username: username,
      email: username,
      employee_id: employeeId,
      full_name: emp.full_name,
      department_id: emp.department_id,
      password_hash: hash,
      salt: salt,
      is_active: isActive,
      aktif: isActive,
      login_attempt: 0,
      last_login: "",
      profile_photo_url: emp.profile_photo_url || "",
      created_at: now,
      created_by: user.user_id,
      updated_at: now,
      updated_by: user.user_id
    }, Repository.headers(CONFIG.SHEET.USER)));

    Repository.insert(CONFIG.SHEET.USER_ROLE, this.cleanByHeaders_({
      user_role_id: userRoleId,
      user_id: userId,
      role_id: roleId,
      role_code: role.role_code || "",
      is_active: 1,
      aktif: 1,
      created_at: now,
      created_by: user.user_id,
      updated_at: now,
      updated_by: user.user_id
    }, Repository.headers(CONFIG.SHEET.USER_ROLE)));

    AuditService.log(user, "CREATE_USER", "USER_MANAGEMENT", userId, "", {
      employee_id: employeeId,
      username: username,
      role_id: roleId
    }, "Create user");

    return {
      success: true,
      message: "Akun user berhasil dibuat.",
      data: { user_id: userId, username: username, employee_id: employeeId, role_id: roleId }
    };
  }

  static getRoles_() {
    return Repository.safeGetAll(CONFIG.SHEET.ROLE)
      .filter(function(r) {
        const activeValue = String(r.is_active !== undefined ? r.is_active : r.aktif || "").toUpperCase();
        return activeValue === "" || activeValue === "1" || activeValue === "TRUE" || activeValue === "AKTIF" || activeValue === "ACTIVE";
      })
      .map(function(r) {
        return {
          role_id: r.role_id || "",
          role_code: r.role_code || "",
          role_name: r.role_name || r.role_code || r.name || r.role_id || ""
        };
      });
  }

  static normalizeEmployee_(r) {
    return {
      employee_id: r.employee_id || r.emp_id || "",
      nik: r.nik || "",
      employee_no: r.employee_no || r.no_karyawan || "",
      full_name: r.full_name || r.nama_lengkap || r.nama || r.name || "",
      department_id: r.department_id || r.dept_id || r.department || "",
      position_id: r.position_id || r.jabatan || "",
      email: r.email || "",
      phone: r.phone || r.no_hp || r.no_wa || "",
      profile_photo_url: r.profile_photo_url || "",
      is_active: r.is_active !== undefined ? r.is_active : r.aktif
    };
  }

  static nextId_(sheetName, key, prefix, pad) {
    const rows = Repository.safeGetAll(sheetName);
    let max = 0;
    rows.forEach(function(r) {
      const n = Number(String(r[key] || "").replace(prefix, ""));
      if (!isNaN(n) && n > max) max = n;
    });
    return prefix + String(max + 1).padStart(pad || 3, "0");
  }

  static cleanByHeaders_(data, headers) {
    const out = {};
    headers.forEach(function(h) {
      if (data[h] !== undefined) out[h] = data[h];
    });
    return out;
  }

  static hashPassword_(password, salt) {
    const raw = String(password || "") + String(salt || "");
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
    return bytes.map(function(b) {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? "0" + v : v;
    }).join("");
  }
}
