class AuthService {
  static login(username, password) {
    username = String(username || "").trim();
    if (!username || !password) return { success: false, message: "Email dan password wajib diisi" };

    const employees = Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE);
    const employee = employees.find(e => same(e.email, username) || same(e.nik, username) || same(e.employee_no, username));

    const users = Repository.safeGetAll(CONFIG.SHEET.USER);
    const user = users.find(u => same(u.username, username) || (employee && same(u.employee_id, employee.employee_id)));

    if (!user) return { success: false, message: "Akun belum dibuat" };
    if (!isActiveValue(user.is_active)) return { success: false, message: "Akun tidak aktif" };

    if (!SecurityService.verifyPassword(password, user.password_hash, user.salt)) {
      Repository.update(CONFIG.SHEET.USER, "user_id", user.user_id, { login_attempt: Number(user.login_attempt || 0) + 1 });
      return { success: false, message: "Password salah" };
    }

    const roleCodes = this.getUserRoles(user.user_id);
    const token = SessionService.create(user, roleCodes);
    Repository.update(CONFIG.SHEET.USER, "user_id", user.user_id, { last_login: new Date(), login_attempt: 0 });
    AuditService.log(user, "LOGIN", "AUTH", user.user_id, "", "Login berhasil");

    return {
      success: true,
      token,
      user: this.getUserProfile(user.user_id),
      roles: roleCodes,
      defaultPage: CONFIG.APP.DEFAULT_PAGE
    };
  }

  static getUserRoles(userId) {
    const userRoles = Repository.safeGetAll(CONFIG.SHEET.USER_ROLE).filter(ur => same(ur.user_id, userId) && isActiveValue(ur.is_active));
    const roles = Repository.safeGetAll(CONFIG.SHEET.ROLE);
    return userRoles.map(ur => roles.find(r => same(r.role_id, ur.role_id)))
      .filter(Boolean)
      .filter(r => isActiveValue(r.is_active))
      .map(r => CONFIG.ROLE_CODE_MAP[String(r.role_code || "").trim()] || String(r.role_code || "").trim())
      .filter(Boolean);
  }

  static getUserProfile(userId) {
    const user = Repository.findOne(CONFIG.SHEET.USER, "user_id", userId);
    if (!user) return null;
    const emp = Repository.findOne(CONFIG.SHEET.EMPLOYEE, "employee_id", user.employee_id) || {};
    const roles = this.getUserRoles(userId);
    return {
      user_id: user.user_id,
      employee_id: user.employee_id,
      username: user.username,
      full_name: emp.full_name || user.username,
      email: emp.email || user.username,
      phone: emp.phone || "",
      department_id: emp.department_id || "",
      profile_photo_url: emp.profile_photo_url || user.profile_photo_url || "",
      roles
    };
  }
}
