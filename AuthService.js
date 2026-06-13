/**
 * =====================================================
 * AUTH SERVICE V2
 * - Register hanya boleh jika employee ada di 04_M_EMPLOYEE
 * - Support database V2 dan sebagian field lama agar migrasi aman
 * =====================================================
 */
class AuthService {

  static login(emailOrUsername, password) {

    const loginKey = String(emailOrUsername || "").trim();

    if (!loginKey || !password) {
      throw new Error("Email/username dan password wajib diisi");
    }

    const employees = Repository.getAll(CONFIG.SHEET.EMPLOYEE);
    const users = Repository.getAll(CONFIG.SHEET.USER);

    const employee = employees.find(e =>
      same(e.email, loginKey) ||
      same(e.username, loginKey) ||
      same(e.nik, loginKey) ||
      same(e.employee_no, loginKey)
    );

    if (!employee) {
      throw new Error("Data karyawan tidak ditemukan pada 04_M_EMPLOYEE");
    }

    const user = users.find(u =>
      same(u.employee_id, employee.employee_id) ||
      same(u.nik, employee.nik) ||
      same(u.email, employee.email) ||
      same(u.username, loginKey)
    );

    if (!user) {
      throw new Error("Akun belum dibuat");
    }

    if (!isActiveValue(user.is_active !== undefined ? user.is_active : user.aktif)) {
      throw new Error("User tidak aktif");
    }

    const attempt = Number(user.login_attempt || 0);
    if (attempt >= 5) {
      throw new Error("Akun terkunci. Hubungi administrator.");
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
      throw new Error("Password salah");
    }

    Repository.update(CONFIG.SHEET.USER, user.user_id, {
      login_attempt: 0,
      last_login: new Date()
    });
    const roleCode = getUserRoleCode(user) || user.role_code || CONFIG.ROLE.REQUESTER;
    const sessionUser = buildSessionUser(user, employee, roleCode);
    SessionService.create(sessionUser);

    AuditService.write("AUTH", user.user_id, "LOGIN", user.user_id, "User login");

    return {
      success: true,
      message: "Login berhasil",
      user: sessionUser
    };
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
      jabatan: employee.position || employee.jabatan,
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

  static logout() {
    const session = SessionService.getSession();
    if (session) {
      AuditService.write("AUTH", session.user_id, "LOGOUT", session.user_id, "User logout");
      SessionService.destroy();
    }

    return true;
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

function buildSessionUser(user, employee, roleCode) {
  return {
    ...user,
    employee_id: employee.employee_id || user.employee_id,
    nik: employee.nik || user.nik,
    nama: employee.full_name || employee.nama || user.nama,
    full_name: employee.full_name || employee.nama || user.nama,
    email: employee.email || user.email,
    department_id: employee.department_id || user.department_id || user.dept_code,
    dept_code: employee.department_id || user.dept_code,
    jabatan: employee.position || user.jabatan,
    position: employee.position || user.jabatan,
    role_code: roleCode || user.role_code || CONFIG.ROLE.REQUESTER
  };
}

function getUserRoleCode(user) {
  if (!user || !user.user_id) return null;

  const userRole = Repository.findOne(
    CONFIG.SHEET.USER_ROLE,
    "user_id",
    user.user_id
  );

  if (!userRole) return null;

  // userRole may store a reference to role_id (e.g. ROLE001) or directly a role_code.
  let candidate = String(userRole.role_id || userRole.role_code || userRole.role || "").trim();

  // If candidate looks like a role_id (starts with ROLE), try to resolve to role entry
  let roleEntry = null;
  if (/^ROLE/i.test(candidate)) {
    roleEntry = Repository.findOne(CONFIG.SHEET.ROLE, "role_id", candidate);
  }

  // If not found yet, try lookup by role_code as well
  if (!roleEntry) {
    roleEntry = Repository.findOne(CONFIG.SHEET.ROLE, "role_code", candidate) || roleEntry;
  }

  const rawCode = roleEntry ? String(roleEntry.role_code || roleEntry.role_id || "").trim() : candidate;

  // Map database role codes to internal CONFIG.ROLE values where they differ
  const map = {
    "SUPER_ADMIN": CONFIG.ROLE.SUPERADMIN,
    "SUPERADMIN": CONFIG.ROLE.SUPERADMIN,
    "FAT_VERIFY": CONFIG.ROLE.FAT,
    "FAT": CONFIG.ROLE.FAT,
    "IA_VERIFY": CONFIG.ROLE.IA,
    "IA": CONFIG.ROLE.IA,
    "GA": CONFIG.ROLE.GA_VERIFY,
    "GA_VERIFY": CONFIG.ROLE.GA_VERIFY,
    "REQUESTER": CONFIG.ROLE.REQUESTER,
    "ADMIN": CONFIG.ROLE.ADMIN,
    "PROCUREMENT": CONFIG.ROLE.PROCUREMENT,
    "WAREHOUSE": CONFIG.ROLE.WAREHOUSE,
    "FINANCE": CONFIG.ROLE.FINANCE
  };

  const upper = String(rawCode || "").trim().toUpperCase();
  if (map[upper]) return map[upper];

  // Fallback: try collapsing non-alphanumeric and compare to CONFIG values
  const collapsed = upper.replace(/[^A-Z0-9]/g, "");
  for (const k in CONFIG.ROLE) {
    if (String(CONFIG.ROLE[k]).toUpperCase() === upper || String(CONFIG.ROLE[k]).toUpperCase() === collapsed) {
      return CONFIG.ROLE[k];
    }
  }

  return rawCode || null;
}

/**
 * =====================================================
 * WEBAPP FUNCTIONS
 * =====================================================
 */
function loginUser(email, password) {
  return AuthService.login(email, password);
}

function logoutUser() {
  return AuthService.logout();
}

function registerUser(data) {
  return AuthService.register(data);
}

function changePassword(email, oldPassword, newPassword) {
  return AuthService.changePassword(email, oldPassword, newPassword);
}

function unlockUser(userId) {
  return AuthService.unlockUser(userId);
}

/**
 * Jalankan manual dari Apps Script Editor jika perlu reset password testing.
 */
function resetUserPasswordFast(emailOrUsername, newPassword) {
  const users = Repository.getAll(CONFIG.SHEET.USER);
  const user = users.find(u =>
    same(u.email, emailOrUsername) ||
    same(u.username, emailOrUsername) ||
    same(u.nik, emailOrUsername)
  );

  if (!user) {
    throw new Error("User tidak ditemukan: " + emailOrUsername);
  }

  const salt = SecurityService.generateSalt();
  const hash = SecurityService.hashPassword(newPassword, salt);

  Repository.update(CONFIG.SHEET.USER, user.user_id, {
    password_hash: hash,
    salt: salt,
    login_attempt: 0,
    is_active: true,
    aktif: true
  });

  return "Password berhasil direset untuk " + emailOrUsername;
}
