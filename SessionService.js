class SessionService {
  static create(user, roleCodes) {
    const token = SecurityService.token();
    const sessionId = uid("SES-");
    const loginTime = new Date();
    const expiredAt = new Date(loginTime.getTime() + CONFIG.APP.SESSION_HOURS * 60 * 60 * 1000);

    const session = {
      session_id: sessionId,
      user_id: user.user_id,
      token,
      login_time: loginTime,
      logout_time: "",
      expired_at: expiredAt,
      device_info: "",
      role_code: (roleCodes || []).join(","),
      status: "ACTIVE"
    };

    Repository.insert(CONFIG.SHEET.USER_SESSION, session);
    CacheService.getScriptCache().put("SESSION:" + token, JSON.stringify({
      user_id: user.user_id,
      username: user.username,
      roles: roleCodes
    }), Math.min(CONFIG.APP.SESSION_HOURS * 3600, 21600));

    return token;
  }

  static validate(token) {
    if (!token) return { success: false, message: "Token kosong" };

    const cached = CacheService.getScriptCache().get("SESSION:" + token);
    if (cached) {
      const data = JSON.parse(cached);
      const user = AuthService.getUserProfile(data.user_id);
      if (user) return { success: true, user, roles: data.roles || [] };
    }

    const sessions = Repository.findBy(CONFIG.SHEET.USER_SESSION, "token", token)
      .filter(s => same(s.status, "ACTIVE"));
    if (!sessions.length) return { success: false, message: "Session tidak ditemukan" };

    const ses = sessions[0];
    if (new Date(ses.expired_at).getTime() < Date.now()) {
      Repository.update(CONFIG.SHEET.USER_SESSION, "session_id", ses.session_id, { status: "EXPIRED" });
      return { success: false, message: "Session expired" };
    }

    const user = AuthService.getUserProfile(ses.user_id);
    if (!user) return { success: false, message: "User session tidak ditemukan" };

    return { success: true, user, roles: String(ses.role_code || "").split(",").filter(Boolean) };
  }

  static logout(token) {
    const rows = Repository.findBy(CONFIG.SHEET.USER_SESSION, "token", token);
    rows.forEach(r => Repository.update(CONFIG.SHEET.USER_SESSION, "session_id", r.session_id, {
      status: "LOGOUT",
      logout_time: new Date()
    }));
    CacheService.getScriptCache().remove("SESSION:" + token);
    return { success: true };
  }
}
