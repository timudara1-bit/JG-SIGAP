/**
 * UserManagementService
 * Modul User Management JG-SIGAP.
 * Fokus update:
 * - Tambah/Edit user pilih karyawan berdasarkan NIK/Nama, bukan employee_id.
 * - employee_id tetap disimpan ke 01_M_USER tetapi tidak ditampilkan di UI.
 * - Departemen otomatis dari master karyawan/database.
 * - Role otomatis dari 02_M_ROLE dan relasi 05_M_USER_ROLE.
 */
class UserManagementService {

  static getAllUsers() {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const employees = this.getEmployeeRows_();
    const departments = this.getDepartmentRows_();
    const userRoles = this.safeGetAll(CONFIG.SHEET.USER_ROLE);
    const roles = this.safeGetAll(CONFIG.SHEET.ROLE);

    return users
      .filter(user => !isDeletedUser_(user))
      .map(user => this.buildUserView_(user, employees, departments, userRoles, roles));
  }

  static getUserById(userId) {
    assertRoleCan("manage_users");

    const user = (Repository.getAll(CONFIG.SHEET.USER) || []).find(u => same(u.user_id, userId));
    if (!user) return null;

    return this.buildUserView_(
      user,
      this.getEmployeeRows_(),
      this.getDepartmentRows_(),
      this.safeGetAll(CONFIG.SHEET.USER_ROLE),
      this.safeGetAll(CONFIG.SHEET.ROLE)
    );
  }

  static searchUsers(searchTerm) {
    assertRoleCan("manage_users");

    const term = String(searchTerm || "").trim().toLowerCase();
    if (!term) return this.getAllUsers();

    return this.getAllUsers().filter(user =>
      String(user.username || "").toLowerCase().includes(term) ||
      String(user.full_name || "").toLowerCase().includes(term) ||
      String(user.email || "").toLowerCase().includes(term) ||
      String(user.nik || "").toLowerCase().includes(term) ||
      String(user.department_name || user.department_id || "").toLowerCase().includes(term) ||
      String(user.role_code || "").toLowerCase().includes(term)
    );
  }

  static createUser(userData) {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const employee = this.resolveEmployee_(userData);
    if (!employee || !(employee.employee_id || employee.nik)) {
      throw new Error("Karyawan wajib dipilih dari database berdasarkan NIK atau Nama");
    }

    const email = String(employee.email || userData.email || "").trim();
    const username = email; // username wajib otomatis dari 04_M_EMPLOYEE.email
    const nik = String(employee.nik || userData.nik || "").trim();

    if (!email) throw new Error("Email karyawan di 04_M_EMPLOYEE masih kosong. Username otomatis memakai email karyawan.");
    if (users.some(u => same(u.username, username) || same(u.email, email))) throw new Error("Email/Username sudah terdaftar");
    if (nik && users.some(u => same(u.nik, nik))) throw new Error("NIK sudah terdaftar sebagai user");

    const salt = SecurityService.generateSalt();
    const hash = SecurityService.hashPassword(userData.password || "password123", salt);
    const userId = this.nextUserId_();
    const role = this.resolveRole_(userData.role_id || userData.role_code);
    if (!role.role_id) throw new Error("Role wajib dipilih dari 02_M_ROLE");
    const roleId = role.role_id;
    const roleCode = role.role_code || roleId;

    const deptCode = String(employee.department_id || employee.dept_code || userData.department_id || "").trim();
    const isActive = userData.is_active !== false;

    const newUser = {
      user_id: userId,
      employee_id: employee.employee_id || "",
      nik: nik,
      nama: employee.full_name || employee.nama || userData.full_name || "",
      username: username,
      email: email,
      password_hash: hash,
      salt: salt,
      last_login: "",
      login_attempt: 0,
      department_id: deptCode,
      dept_code: deptCode,
      jabatan: employee.position || employee.jabatan || userData.position || "",
      role_code: roleCode,
      approver_level: Number(userData.approver_level || 0),
      is_active: isActive,
      aktif: isActive,
      created_at: new Date(),
      created_date: new Date(),
      created_by: this.currentUserId_(),
      last_modified_date: new Date()
    };

    Repository.insert(CONFIG.SHEET.USER, newUser);
    this.upsertUserRole_(userId, roleId);

    return this.getUserById(userId) || newUser;
  }

  static updateUser(userId, userData) {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const user = users.find(u => same(u.user_id, userId));
    if (!user) throw new Error("User tidak ditemukan");

    const employee = this.resolveEmployee_(userData) || this.resolveEmployee_(user) || {};
    const newEmail = String(employee.email || userData.email || user.email || "").trim();
    const newNik = String(employee.nik || userData.nik || user.nik || "").trim();

    if (newEmail && users.some(u => !same(u.user_id, userId) && same(u.email, newEmail))) {
      throw new Error("Email sudah terdaftar");
    }
    if (newNik && users.some(u => !same(u.user_id, userId) && same(u.nik, newNik))) {
      throw new Error("NIK sudah terdaftar sebagai user lain");
    }

    const currentRoleId = this.resolveUserRoleId_(user, this.safeGetAll(CONFIG.SHEET.USER_ROLE), this.safeGetAll(CONFIG.SHEET.ROLE));
    const role = this.resolveRole_(userData.role_id || userData.role_code || currentRoleId || user.role_id || user.role_code);
    if (!role.role_id) throw new Error("Role wajib dipilih dari 02_M_ROLE");
    const roleId = role.role_id;
    const roleCode = role.role_code || roleId;

    const isActive = userData.is_active !== undefined
      ? userData.is_active === true
      : isActiveValue(user.is_active !== undefined ? user.is_active : user.aktif);

    const deptCode = String(employee.department_id || employee.dept_code || userData.department_id || user.department_id || user.dept_code || "").trim();

    const updated = {
      ...user,
      username: newEmail,
      email: newEmail,
      employee_id: employee.employee_id || userData.employee_id || user.employee_id || "",
      nik: newNik,
      nama: employee.full_name || employee.nama || userData.full_name || userData.nama || user.nama || "",
      department_id: deptCode,
      dept_code: deptCode,
      jabatan: employee.position || employee.jabatan || userData.position || userData.jabatan || user.jabatan || "",
      role_code: roleCode,
      approver_level: Number(userData.approver_level || 0),
      is_active: isActive,
      aktif: isActive,
      update_at: new Date(),
      last_modified_date: new Date(),
      last_modified_by: this.currentUserId_()
    };

    Repository.update(CONFIG.SHEET.USER, userId, updated);
    this.upsertUserRole_(userId, roleId);

    return this.getUserById(userId) || updated;
  }

  static deleteUser(userId) {
    assertRoleCan("manage_users");

    const user = Repository.findOne(CONFIG.SHEET.USER, "user_id", userId);
    if (!user) throw new Error("User tidak ditemukan");

    Repository.update(CONFIG.SHEET.USER, userId, {
      is_active: false,
      aktif: false,
      delete_at: new Date(),
      last_modified_date: new Date(),
      last_modified_by: this.currentUserId_()
    });
    return true;
  }

  static updateUserRole(userId, roleId, approverLevel = 0) {
    assertRoleCan("manage_users");

    const user = Repository.findOne(CONFIG.SHEET.USER, "user_id", userId);
    if (!user) throw new Error("User tidak ditemukan");

    const role = this.resolveRole_(roleId);
    if (!role.role_id) throw new Error("Role wajib dipilih dari 02_M_ROLE");

    Repository.update(CONFIG.SHEET.USER, userId, {
      role_code: role.role_code || role.role_id,
      role_id: role.role_id,
      approver_level: Number(approverLevel || 0),
      last_modified_date: new Date(),
      last_modified_by: this.currentUserId_()
    });

    this.upsertUserRole_(userId, role.role_id);
    return this.getUserById(userId);
  }

  static getAvailableRoles() {
    assertRoleCan("manage_users");

    const roles = this.safeGetAll(CONFIG.SHEET.ROLE);

    return roles
      .filter(role => {
        const activeRaw = role.is_active !== undefined ? role.is_active : role.aktif;
        return activeRaw === undefined || activeRaw === "" || isActiveValue(activeRaw);
      })
      .map(role => {
        const roleId = String(role.role_id || role.id || role.role_code || role.code || role.kode || "").trim();
        const roleCode = String(role.role_code || role.code || roleId || "").trim();
        return {
          role_id: roleId,
          role_code: roleCode,
          role_name: role.role_name || role.name || role.nama_role || role.nama || roleCode || roleId,
          description: role.description || role.keterangan || ""
        };
      })
      .filter(role => role.role_id);
  }

  static getAvailableEmployees() {
    assertRoleCan("manage_users");

    const departments = this.getDepartmentRows_();
    return this.getEmployeeRows_().map(e => {
      const deptId = e.department_id || e.dept_code || e.kode_dept || "";
      const dept = departments.find(d => same(d.department_id, deptId) || same(d.dept_code, deptId) || same(d.code, deptId)) || {};
      return {
        employee_id: e.employee_id || e.id_employee || e.emp_id || "",
        nik: e.nik || e.NIK || "",
        full_name: e.full_name || e.nama || e.nama_lengkap || e.name || "",
        email: e.email || "",
        department_id: deptId,
        department_name: dept.department_name || dept.dept_name || dept.name || e.department_name || e.dept_name || deptId,
        position: e.position || e.jabatan || ""
      };
    }).filter(e => e.nik || e.full_name || e.employee_id);
  }

  static getAvailableDepartments() {
    assertRoleCan("manage_users");
    return this.getDepartmentRows_().map(d => ({
      department_id: d.department_id || d.dept_code || d.code || "",
      department_name: d.department_name || d.dept_name || d.name || ""
    }));
  }

  static resetPassword(userId, newPassword = "password123") {
    assertRoleCan("manage_users");

    const user = Repository.findOne(CONFIG.SHEET.USER, "user_id", userId);
    if (!user) throw new Error("User tidak ditemukan");

    const salt = SecurityService.generateSalt();
    const hash = SecurityService.hashPassword(newPassword, salt);

    Repository.update(CONFIG.SHEET.USER, userId, {
      password_hash: hash,
      salt: salt,
      login_attempt: 0,
      last_modified_date: new Date(),
      last_modified_by: this.currentUserId_()
    });

    return { success: true, message: "Password berhasil direset ke: " + newPassword };
  }

  static getUserActivityLog(userId, limit = 10) {
    assertRoleCan("manage_users");

    return this.safeGetAll(CONFIG.SHEET.AUDIT_LOG)
      .filter(log => same(log.user_id, userId) || same(log.actor_id, userId) || same(log.target_id, userId))
      .slice(-Number(limit || 10))
      .reverse();
  }

  static toggleUserStatus(userId, isActive) {
    assertRoleCan("manage_users");

    const user = Repository.findOne(CONFIG.SHEET.USER, "user_id", userId);
    if (!user) throw new Error("User tidak ditemukan");

    Repository.update(CONFIG.SHEET.USER, userId, {
      is_active: isActive === true,
      aktif: isActive === true,
      last_modified_date: new Date(),
      last_modified_by: this.currentUserId_()
    });

    return this.getUserById(userId);
  }

  static buildUserView_(user, employees, departments, userRoles, roles) {
    const employee = employees.find(emp =>
      same(emp.employee_id, user.employee_id) ||
      same(emp.nik, user.nik) ||
      same(emp.email, user.email)
    ) || {};

    const roleInfo = this.resolveUserRoleInfo_(user, userRoles, roles);
    const departmentId = employee.department_id || employee.dept_code || user.department_id || user.dept_code || "";
    const dept = departments.find(d =>
      same(d.department_id, departmentId) ||
      same(d.dept_code, departmentId) ||
      same(d.code, departmentId)
    ) || {};

    return {
      user_id: user.user_id,
      username: user.username || user.email || user.nik || "",
      email: user.email || employee.email || "",
      employee_id: user.employee_id || employee.employee_id || "",
      nik: user.nik || employee.nik || "",
      full_name: employee.full_name || employee.nama || employee.nama_lengkap || user.nama || user.full_name || "",
      position: employee.position || employee.jabatan || user.jabatan || user.position || "",
      department_id: departmentId,
      department_name: dept.department_name || dept.dept_name || dept.name || employee.department_name || employee.dept_name || departmentId,
      role_id: roleInfo.role_id,
      role_code: roleInfo.role_code,
      role_name: roleInfo.role_name,
      approver_level: Number(user.approver_level || 0),
      is_active: isActiveValue(user.is_active !== undefined ? user.is_active : user.aktif),
      created_date: user.created_date || user.created_at || user.create_at || "",
      last_login: user.last_login || "",
      login_attempt: Number(user.login_attempt || 0)
    };
  }

  static resolveUserRoleId_(user, userRoles, roles) {
    return this.resolveUserRoleInfo_(user, userRoles, roles).role_id;
  }

  static resolveUserRoleInfo_(user, userRoles, roles) {
    const userRole = userRoles.find(ur => same(ur.user_id, user.user_id));
    const candidate = String((userRole && (userRole.role_id || userRole.role_code || userRole.role)) || user.role_id || user.role_code || "").trim();
    if (!candidate) return { role_id: "", role_code: "", role_name: "" };

    const role = roles.find(r => same(r.role_id, candidate) || same(r.role_code, candidate) || same(r.code, candidate));
    const roleId = String((role && (role.role_id || role.id)) || candidate).trim();
    const roleCode = String((role && (role.role_code || role.code)) || roleId).trim();
    const roleName = String((role && (role.role_name || role.name || role.nama_role || role.nama)) || roleCode).trim();
    return { role_id: roleId, role_code: roleCode, role_name: roleName };
  }

  static resolveRole_(roleValue) {
    const candidate = String(roleValue || "").trim();
    if (!candidate) return { role_id: "", role_code: "", role_name: "" };
    const roles = this.safeGetAll(CONFIG.SHEET.ROLE);
    const role = roles.find(r => same(r.role_id, candidate) || same(r.role_code, candidate) || same(r.code, candidate));
    if (!role) return { role_id: candidate, role_code: candidate, role_name: candidate };
    const roleId = String(role.role_id || role.id || role.role_code || role.code || candidate).trim();
    const roleCode = String(role.role_code || role.code || roleId).trim();
    const roleName = String(role.role_name || role.name || role.nama_role || role.nama || roleCode).trim();
    return { role_id: roleId, role_code: roleCode, role_name: roleName };
  }

  static resolveEmployee_(data) {
    const employees = this.getEmployeeRows_();
    const key = String(data.employee_search || "").trim().toLowerCase();
    const employeeId = String(data.employee_id || "").trim();
    const nik = String(data.nik || "").trim();
    const email = String(data.email || "").trim();
    const name = String(data.full_name || data.nama || "").trim().toLowerCase();

    return employees.find(e =>
      same(e.employee_id, employeeId) ||
      same(e.id_employee, employeeId) ||
      same(e.emp_id, employeeId) ||
      same(e.nik, nik) ||
      same(e.email, email)
    ) || employees.find(e => {
      const eName = String(e.full_name || e.nama || e.nama_lengkap || e.name || "").trim().toLowerCase();
      const eNik = String(e.nik || "").trim().toLowerCase();
      const display = [eNik, eName].filter(Boolean).join(" - ");
      return (key && (display.includes(key) || key.includes(eNik) || key.includes(eName))) || (name && eName === name);
    }) || null;
  }

  static upsertUserRole_(userId, roleId) {
    const sheetName = CONFIG.SHEET.USER_ROLE;
    const userRoles = this.safeGetAll(sheetName);
    const existing = userRoles.find(ur => same(ur.user_id, userId));

    if (existing) {
      const key = existing.user_role_id || existing.id || userId;
      const idField = existing.user_role_id ? "user_role_id" : (existing.id ? "id" : "user_id");
      Repository.update(sheetName, key, {
        user_id: userId,
        role_id: roleId,
        role_code: "",
        role_name: "",
        updated_at: new Date()
      }, idField);
      return;
    }

    Repository.insert(sheetName, {
      user_role_id: this.nextUserRoleId_(),
      user_id: userId,
      role_id: roleId,
      role_code: "",
      role_name: "",
      created_at: new Date()
    });
  }

  static nextUserId_() {
    const users = this.safeGetAll(CONFIG.SHEET.USER);
    let max = 0;
    users.forEach(u => {
      const m = String(u.user_id || "").match(/USR(\d+)/i);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return "USR" + String(max + 1).padStart(3, "0");
  }

  static nextUserRoleId_() {
    const rows = this.safeGetAll(CONFIG.SHEET.USER_ROLE);
    let max = 0;
    rows.forEach(r => {
      const m = String(r.user_role_id || "").match(/UR(\d+)/i);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return "UR" + String(max + 1).padStart(3, "0");
  }

  static getEmployeeRows_() {
    const configured = this.safeGetAll(CONFIG.SHEET.EMPLOYEE);
    if (configured.length) return configured;

    // Fallback untuk database lama yang masih memakai nama MST_KARYAWAN.
    const legacy = this.rawGetAll_("MST_KARYAWAN");
    if (legacy.length) return legacy;

    return this.rawGetAll_("04_M_EMPLOYEE");
  }

  static getDepartmentRows_() {
    const configured = this.safeGetAll(CONFIG.SHEET.DEPARTMENT);
    if (configured.length) return configured;
    return this.rawGetAll_("03_M_DEPARTMENT");
  }

  static safeGetAll(sheetName) {
    try {
      return Repository.getAll(sheetName) || [];
    } catch (err) {
      Logger.log("safeGetAll gagal: " + sheetName + " - " + err.message);
      return [];
    }
  }

  static rawGetAll_(sheetName) {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      if (!sheet) return [];
      const values = sheet.getDataRange().getValues();
      if (values.length < 2) return [];
      const headers = values.shift();
      return values.map(row => {
        const obj = {};
        headers.forEach((header, i) => obj[header] = row[i]);
        return obj;
      });
    } catch (err) {
      Logger.log("rawGetAll_ gagal: " + sheetName + " - " + err.message);
      return [];
    }
  }

  static currentUserId_() {
    const session = SessionService.getSession();
    return session ? session.user_id : "SYSTEM";
  }
}

function same(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

function isDeletedUser_(user) {
  return !!(user.delete_at || user.deleted_at);
}

