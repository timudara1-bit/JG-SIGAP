/**
 * UserManagementService
 * Manages user CRUD operations, role assignment, and access control
 */

class UserManagementService {

  /**
   * Get all users with their profile information
   */
  static getAllUsers() {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const employees = Repository.getAll(CONFIG.SHEET.EMPLOYEE) || [];

    return users.map(user => {
      const employee = employees.find(emp =>
        same(emp.employee_id, user.employee_id) ||
        same(emp.nik, user.nik) ||
        same(emp.email, user.email)
      );

      return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        employee_id: user.employee_id,
        nik: employee?.nik || user.nik,
        full_name: employee?.full_name || employee?.nama || "",
        position: employee?.position || user.jabatan || "",
        department_id: employee?.department_id || user.department_id || user.dept_code || "",
        role_code: user.role_code,
        approver_level: user.approver_level || 0,
        is_active: user.is_active !== false,
        created_date: user.created_date,
        last_login: user.last_login
      };
    });
  }

  /**
   * Get single user by ID
   */
  static getUserById(userId) {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const employees = Repository.getAll(CONFIG.SHEET.EMPLOYEE) || [];

    const user = users.find(u => same(u.user_id, userId));
    if (!user) return null;

    const employee = employees.find(emp =>
      same(emp.employee_id, user.employee_id) ||
      same(emp.nik, user.nik) ||
      same(emp.email, user.email)
    );

    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      employee_id: user.employee_id,
      nik: employee?.nik || user.nik,
      full_name: employee?.full_name || employee?.nama || "",
      position: employee?.position || user.jabatan || "",
      department_id: employee?.department_id || user.department_id || user.dept_code || "",
      role_code: user.role_code,
      approver_level: user.approver_level || 0,
      is_active: user.is_active !== false,
      created_date: user.created_date,
      last_login: user.last_login
    };
  }

  /**
   * Search users by name, email, or username
   */
  static searchUsers(searchTerm) {
    assertRoleCan("manage_users");

    const term = String(searchTerm || "").trim().toLowerCase();
    if (!term) return this.getAllUsers();

    const users = this.getAllUsers();
    return users.filter(user =>
      (user.full_name?.toLowerCase().includes(term)) ||
      (user.email?.toLowerCase().includes(term)) ||
      (user.username?.toLowerCase().includes(term)) ||
      (user.nik?.toLowerCase().includes(term))
    );
  }

  /**
   * Create new user
   */
  static createUser(userData) {
    assertRoleCan("manage_users");

    const newUser = {
      user_id: Utilities.getUuid(),
      username: String(userData.username || "").trim(),
      email: String(userData.email || "").trim(),
      employee_id: String(userData.employee_id || "").trim(),
      nik: String(userData.nik || "").trim(),
      role_code: String(userData.role_code || CONFIG.ROLE.REQUESTER).trim(),
      approver_level: parseInt(userData.approver_level || 0),
      is_active: userData.is_active !== false,
      created_date: new Date(),
      created_by: SessionService.getSession().user_id,
      password_hash: this.hashPassword(userData.password || "password123"),
      last_modified_date: new Date()
    };

    // Validate required fields
    if (!newUser.username || !newUser.email) {
      throw new Error("Username dan Email harus diisi");
    }

    // Check if user already exists
    const existingUsers = Repository.getAll(CONFIG.SHEET.USER) || [];
    if (existingUsers.some(u => same(u.username, newUser.username))) {
      throw new Error("Username sudah terdaftar");
    }
    if (existingUsers.some(u => same(u.email, newUser.email))) {
      throw new Error("Email sudah terdaftar");
    }

    Repository.insert(CONFIG.SHEET.USER, newUser);
    return newUser;
  }

  /**
   * Update existing user
   */
  static updateUser(userId, userData) {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const user = users.find(u => same(u.user_id, userId));

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    const updated = {
      ...user,
      email: String(userData.email || user.email).trim(),
      employee_id: String(userData.employee_id || user.employee_id).trim(),
      nik: String(userData.nik || user.nik).trim(),
      role_code: String(userData.role_code || user.role_code).trim(),
      approver_level: parseInt(userData.approver_level || user.approver_level || 0),
      is_active: userData.is_active !== undefined ? userData.is_active : user.is_active,
      last_modified_date: new Date(),
      last_modified_by: SessionService.getSession().user_id
    };

    // Check email uniqueness if changed
    if (userData.email && userData.email !== user.email) {
      if (users.some(u => !same(u.user_id, userId) && same(u.email, userData.email))) {
        throw new Error("Email sudah terdaftar");
      }
    }

    Repository.update(CONFIG.SHEET.USER, userId, updated);
    return updated;
  }

  /**
   * Delete user
   */
  static deleteUser(userId) {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const user = users.find(u => same(u.user_id, userId));

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    // Soft delete - mark as inactive instead of hard delete
    const updated = {
      ...user,
      is_active: false,
      last_modified_date: new Date(),
      last_modified_by: SessionService.getSession().user_id
    };

    Repository.update(CONFIG.SHEET.USER, userId, updated);
    return true;
  }

  /**
   * Update user role and permissions
   */
  static updateUserRole(userId, roleCode, approverLevel = 0) {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const user = users.find(u => same(u.user_id, userId));

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    // Validate role exists
    const roles = Repository.getAll(CONFIG.SHEET.ROLE) || [];
    if (!roles.some(r => same(r.role_code, roleCode))) {
      throw new Error("Role tidak valid: " + roleCode);
    }

    const updated = {
      ...user,
      role_code: String(roleCode).trim(),
      approver_level: parseInt(approverLevel || 0),
      last_modified_date: new Date(),
      last_modified_by: SessionService.getSession().user_id
    };

    Repository.update(CONFIG.SHEET.USER, userId, updated);
    return updated;
  }

  /**
   * Get available roles
   */
  static getAvailableRoles() {
    assertRoleCan("manage_users");

    const roles = Repository.getAll(CONFIG.SHEET.ROLE) || [];
    return roles.map(role => ({
      role_code: role.role_code,
      role_name: role.role_name,
      description: role.description
    }));
  }

  /**
   * Reset user password
   */
  static resetPassword(userId, newPassword = "password123") {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const user = users.find(u => same(u.user_id, userId));

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    const updated = {
      ...user,
      password_hash: this.hashPassword(newPassword),
      last_modified_date: new Date(),
      last_modified_by: SessionService.getSession().user_id
    };

    Repository.update(CONFIG.SHEET.USER, userId, updated);
    return {
      success: true,
      message: "Password berhasil direset ke: " + newPassword
    };
  }

  /**
   * Get user activity log
   */
  static getUserActivityLog(userId, limit = 10) {
    assertRoleCan("manage_users");

    const logs = Repository.getAll(CONFIG.SHEET.AUDIT_LOG) || [];
    return logs
      .filter(log => same(log.user_id, userId))
      .slice(-limit)
      .reverse();
  }

  /**
   * Activate/Deactivate user
   */
  static toggleUserStatus(userId, isActive) {
    assertRoleCan("manage_users");

    const users = Repository.getAll(CONFIG.SHEET.USER) || [];
    const user = users.find(u => same(u.user_id, userId));

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    const updated = {
      ...user,
      is_active: isActive === true,
      last_modified_date: new Date(),
      last_modified_by: SessionService.getSession().user_id
    };

    Repository.update(CONFIG.SHEET.USER, userId, updated);
    return updated;
  }

  /**
   * Simple password hash (in production, use stronger hashing)
   */
  static hashPassword(password) {
    // For demo purposes only - in production use proper bcrypt or similar
    return Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      password
    ).toString();
  }

}

/**
 * Helper function for case-insensitive comparison
 */
function same(a, b) {
  return String(a || "").toLowerCase().trim() ===
         String(b || "").toLowerCase().trim();
}
