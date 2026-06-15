/**
 * =====================================================
 * AUTH SERVICE V2.1 - TOKEN SESSION FIX
 * - Login returns success:true + token + user + role + redirectPage
 * - Role ROLE001 -> 02_M_ROLE.role_code -> internal CONFIG.ROLE
 * - Compatible with 04_M_EMPLOYEE, 01_M_USER, 05_M_USER_ROLE
 * =====================================================
 */
class AuthService {

  static login(emailOrUsername, password, deviceInfo) {
    const loginKey = String(emailOrUsername || "").trim();

    if (!loginKey || !password) {
      return {
        success: false,
        message: "Email/username dan password wajib diisi"
      };
    }

    try {
      const employees = Repository.getAll(CONFIG.SHEET.EMPLOYEE);
      const users = Repository.getAll(CONFIG.SHEET.USER);

      let employee = employees.find(e =>
        same(e.email, loginKey) ||
        same(e.username, loginKey) ||
        same(e.nik, loginKey) ||
        same(e.employee_no, loginKey)
      );

      let user = null;

      if (employee) {
        user = users.find(u =>
          same(u.employee_id, employee.employee_id) ||
          same(u.nik, employee.nik) ||
          same(u.email, employee.email) ||
          same(u.username, loginKey)
        );
      }

      if (!user) {
        user = users.find(u =>
          same(u.username, loginKey) ||
          same(u.email, loginKey) ||
          same(u.nik, loginKey)
        );
      }

      if (!user) {
        return {
          success: false,
          message: "Akun belum dibuat"
        };
      }

      if (!employee) {
        employee = employees.find(e =>
          same(e.employee_id, user.employee_id) ||
          same(e.nik, user.nik) ||
          same(e.email, user.email)
        );
      }

      if (!employee) {
        return {
          success: false,
          message: "Data karyawan tidak ditemukan pada 04_M_EMPLOYEE"
        };
      }

      if (!isActiveValue(user.is_active !== undefined ? user.is_active : user.aktif)) {
        return {
          success: false,
          message: "User tidak aktif"
        };
      }

      const attempt = Number(user.login_attempt || 0);
      if (attempt >= 5) {
        return {
          success: false,
          message: "Akun terkunci. Hubungi administrator."
        };
      }

      const valid = SecurityService.verifyPassword(
        password,
        user.salt || "",
        user.password_hash || ""
      );

      if (!valid) {
        Repository.update(CONFIG.SHEET.USER, user.user_id, {
          login_attempt: attempt + 1
        });
        return {
          success: false,
          message: "Password salah"
        };
      }

      const roles = AuthService.getUserRoles(user.user_id);
      const primaryRole = AuthService.getPrimaryRole(roles);
      const redirectPage = AuthService.getRedirectPage(primaryRole);

      const sessionUser = buildSessionUser(
        user,
        employee,
        roles,
        primaryRole,
        redirectPage
      );

      const session = SessionService.create(
        sessionUser,
        deviceInfo || "WEB_BROWSER"
      );

      Repository.update(CONFIG.SHEET.USER, user.user_id, {
        login_attempt: 0,
        last_login: new Date()
      });

      try {
        AuditService.write("AUTH", user.user_id, "LOGIN", user.user_id, "User login");
      } catch (auditErr) {
        Logger.log("AUDIT LOGIN ERROR = " + auditErr.message);
      }

      Logger.log("LOGIN SUCCESS USER = " + user.user_id);
      Logger.log("LOGIN SUCCESS ROLE = " + primaryRole);
      Logger.log("LOGIN SUCCESS REDIRECT = " + redirectPage);
      Logger.log("LOGIN SUCCESS TOKEN = " + session.token);

      return {
        success: true,
        message: "Login berhasil",
        token: session.token,
        user: session.user || sessionUser,
        role: primaryRole,
        role_code: primaryRole,
        roles: roles,
        redirectPage: redirectPage || "dashboard",
        expired_at: String(session.expired_at || "")
      };

    } catch (err) {
      Logger.log("LOGIN ERROR = " + err.message);
      return {
        success: false,
        message: err.message || "Login gagal"
      };
    }
  }

  static register(data) {
    const nik = String(data.nik || "").trim();

    if (!nik) {
      throw new Error("NIK wajib diisi");
    }

    const employee = Repository.findOne(CONFIG.SHEET.EMPLOYEE, "nik", nik);

    if (!employee) {
      throw new Error("NIK tidak ditemukan pada master karyawan 04_M_EMPLOYEE");
    }

    if (!isActiveValue(employee.is_active)) {
      throw new Error("Data karyawan tidak aktif");
    }

    const users = Repository.getAll(CONFIG.SHEET.USER);
    const existing = users.find(u =>
      same(u.employee_id, employee.employee_id) ||
      same(u.nik, employee.nik) ||
      same(u.email, employee.email)
    );

    if (existing) {
      throw new Error("User sudah terdaftar");
    }

    if (data.password !== data.confirmPassword) {
      throw new Error("Konfirmasi password tidak cocok");
    }

    const salt = SecurityService.generateSalt();
    const passwordHash = SecurityService.hashPassword(data.password, salt);

    const user = {
      user_id: Utilities.getUuid(),
      employee_id: employee.employee_id,
      nik: employee.nik,
      nama: employee.full_name || employee.nama,
      username: employee.email || employee.nik,
      email: employee.email,
      password_hash: passwordHash,
      salt: salt,
      last_login: "",
      login_attempt: 0,
      department_id: employee.department_id,
      dept_code: employee.department_id || employee.dept_code,
      jabatan: employee.position || employee.position_id || employee.jabatan,
      role_code: CONFIG.ROLE.REQUESTER,
      approver_level: 0,
      is_active: true,
      aktif: true,
      created_at: new Date()
    };

    Repository.insert(CONFIG.SHEET.USER, user);

    return {
      success: true,
      message: "Registrasi berhasil"
    };
  }

  static changePassword(emailOrUsername, oldPassword, newPassword) {
    const loginKey = String(emailOrUsername || "").trim();
    const users = Repository.getAll(CONFIG.SHEET.USER);
    const user = users.find(u =>
      same(u.email, loginKey) ||
      same(u.username, loginKey) ||
      same(u.nik, loginKey)
    );

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    const valid = SecurityService.verifyPassword(
      oldPassword,
      user.salt || "",
      user.password_hash || ""
    );

    if (!valid) {
      throw new Error("Password lama salah");
    }

    const salt = SecurityService.generateSalt();
    const hash = SecurityService.hashPassword(newPassword, salt);

    Repository.update(CONFIG.SHEET.USER, user.user_id, {
      password_hash: hash,
      salt: salt,
      login_attempt: 0
    });

    return {
      success: true,
      message: "Password berhasil diubah"
    };
  }

  static unlockUser(userId) {
    Repository.update(CONFIG.SHEET.USER, userId, { login_attempt: 0 });
    return {
      success: true,
      message: "User berhasil dibuka"
    };
  }

  static logout(token) {
    const session = SessionService.getSession(token);

    if (session) {
      try {
        AuditService.write("AUTH", session.user_id, "LOGOUT", session.user_id, "User logout");
      } catch (auditErr) {
        Logger.log("AUDIT LOGOUT ERROR = " + auditErr.message);
      }
    }

    SessionService.logout(token);

    return {
      success: true,
      message: "Logout berhasil"
    };
  }

  static getUserRoles(userId) {
    const userRoles = Repository.getAll(CONFIG.SHEET.USER_ROLE);
    const roles = Repository.getAll(CONFIG.SHEET.ROLE);

    const result = userRoles
      .filter(r =>
        same(r.user_id, userId) &&
        isActiveValue(r.is_active)
      )
      .map(ur => {
        const roleIdOrCode = String(ur.role_id || ur.role_code || "").trim();
        const role = roles.find(x =>
          same(x.role_id, roleIdOrCode) ||
          same(x.role_code, roleIdOrCode)
        );
        const rawCode = role ? String(role.role_code || role.role_id || "").trim() : roleIdOrCode;
        return normalizeDatabaseRoleCode(rawCode);
      })
      .filter(Boolean);

    return result.length ? uniqueArray(result) : [CONFIG.ROLE.REQUESTER];
  }

  static getPrimaryRole(roles) {
    const normalizedRoles = (roles || []).map(r => normalizeDatabaseRoleCode(r));

    const priority = [
      CONFIG.ROLE.SUPERADMIN,
      CONFIG.ROLE.ADMIN,
      CONFIG.ROLE.GA_VERIFY,
      CONFIG.ROLE.GA_PP,
      CONFIG.ROLE.FAT,
      CONFIG.ROLE.IA,
      CONFIG.ROLE.PROCUREMENT,
      CONFIG.ROLE.WAREHOUSE,
      CONFIG.ROLE.FINANCE,
      CONFIG.ROLE.MONITORING,
      CONFIG.ROLE.REQUESTER
    ];

    for (const role of priority) {
      if (normalizedRoles.includes(role)) return role;
    }

    return normalizedRoles[0] || CONFIG.ROLE.REQUESTER;
  }

  static getRedirectPage(role) {
    const normalized = normalizeDatabaseRoleCode(role);

    const map = {};
    map[CONFIG.ROLE.SUPERADMIN] = "dashboard";
    map[CONFIG.ROLE.ADMIN] = "dashboard";
    map[CONFIG.ROLE.REQUESTER] = "dashboard";
    map[CONFIG.ROLE.GA_VERIFY] = "dashboard";
    map[CONFIG.ROLE.GA_PP] = "dashboard";
    map[CONFIG.ROLE.FAT] = "dashboard";
    map[CONFIG.ROLE.IA] = "dashboard";
    map[CONFIG.ROLE.PROCUREMENT] = "dashboard";
    map[CONFIG.ROLE.WAREHOUSE] = "dashboard";
    map[CONFIG.ROLE.FINANCE] = "dashboard";
    map[CONFIG.ROLE.MONITORING] = "dashboard";

    return map[normalized] || "dashboard";
  }
}

function same(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

function isActiveValue(value) {
  if (value === undefined || value === null || value === "") return true;
  const v = String(value).trim().toUpperCase();
  return ["TRUE", "1", "YA", "Y", "AKTIF", "ACTIVE"].includes(v);
}

function uniqueArray(arr) {
  const seen = {};
  return (arr || []).filter(item => {
    if (!item || seen[item]) return false;
    seen[item] = true;
    return true;
  });
}

function normalizeDatabaseRoleCode(rawCode) {
  const upper = String(rawCode || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  const map = {
    SA: CONFIG.ROLE.SUPERADMIN,
    SUPERADMIN: CONFIG.ROLE.SUPERADMIN,
    SUPER_ADMIN: CONFIG.ROLE.SUPERADMIN,
    ADM: CONFIG.ROLE.ADMIN,
    ADMIN: CONFIG.ROLE.ADMIN,
    REQ: CONFIG.ROLE.REQUESTER,
    REQUESTER: CONFIG.ROLE.REQUESTER,
    GAV: CONFIG.ROLE.GA_VERIFY,
    GA: CONFIG.ROLE.GA_VERIFY,
    GAVERIFY: CONFIG.ROLE.GA_VERIFY,
    GA_VERIFY: CONFIG.ROLE.GA_VERIFY,
    GAPP: CONFIG.ROLE.GA_PP,
    GA_PP: CONFIG.ROLE.GA_PP,
    FAT: CONFIG.ROLE.FAT,
    FATVERIFY: CONFIG.ROLE.FAT,
    FAT_VERIFY: CONFIG.ROLE.FAT,
    IA: CONFIG.ROLE.IA,
    IAVERIFY: CONFIG.ROLE.IA,
    IA_VERIFY: CONFIG.ROLE.IA,
    PR: CONFIG.ROLE.PROCUREMENT,
    SC: CONFIG.ROLE.PROCUREMENT,
    PROCUREMENT: CONFIG.ROLE.PROCUREMENT,
    RCV: CONFIG.ROLE.WAREHOUSE,
    RECEIVE: CONFIG.ROLE.WAREHOUSE,
    WAREHOUSE: CONFIG.ROLE.WAREHOUSE,
    INV: CONFIG.ROLE.FINANCE,
    INVOICE: CONFIG.ROLE.FINANCE,
    FINANCE: CONFIG.ROLE.FINANCE,
    MONITORING: CONFIG.ROLE.MONITORING
  };

  return map[upper] || String(rawCode || "").trim().toUpperCase();
}

function buildSessionUser(user, employee, roles, primaryRole, redirectPage) {
  return {
    user_id: user.user_id,
    employee_id: employee.employee_id || user.employee_id,
    nik: employee.nik || user.nik,
    nama: employee.full_name || employee.nama || user.nama,
    full_name: employee.full_name || employee.nama || user.nama,
    email: employee.email || user.email || user.username,
    username: user.username || employee.email || employee.nik,
    department_id: employee.department_id || user.department_id || user.dept_code,
    dept_code: employee.department_id || user.dept_code,
    position_id: employee.position_id || employee.position || user.position_id || user.jabatan,
    jabatan: employee.position || employee.position_id || user.jabatan,
    role: primaryRole,
    role_code: primaryRole,
    roles: roles || [],
    redirectPage: redirectPage || "dashboard"
  };
}

