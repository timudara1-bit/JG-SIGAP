const ROLE_ACCESS_RULES = {
  SUPERADMIN: {
    menus: [
      "Dashboard",
      "Master User",
      "Master Vendor",
      "Approval Matrix",
      "SLA",
      "System Setting"
    ],
    actions: [
      "view_all",
      "create_all",
      "edit_all",
      "delete_all",
      "approval",
      "loader"
    ]
  },
  ADMIN: {
    menus: [
      "Dashboard",
      "Master User",
      "Master Vendor",
      "Approval Matrix",
      "SLA",
      "System Setting"
    ],
    actions: [
      "view_dashboard",
      "manage_users",
      "manage_vendors",
      "manage_approval_matrix",
      "manage_sla",
      "system_setting"
    ]
  },
  REQUESTER: {
    menus: ["Dashboard", "Buat FPB", "FPB Saya"],
    actions: ["view_dashboard", "create_fpb", "view_own_fpb"]
  },
  GA_VERIFY: {
    menus: ["Dashboard", "Verifikasi FPB", "Monitoring"],
    actions: ["view_dashboard", "verify_fpb", "view_monitoring"]
  },
  GA_PP: {
    menus: ["Dashboard", "PP Draft", "Monitoring"],
    actions: ["view_dashboard", "draft_pp", "view_monitoring"]
  },
  FAT: {
    menus: ["Dashboard", "Approval PP"],
    actions: ["view_dashboard", "approve_pp"]
  },
  IA: {
    menus: ["Dashboard", "Approval PP"],
    actions: ["view_dashboard", "approve_pp"]
  },
  PROCUREMENT: {
    menus: ["Dashboard", "PR", "PO", "Receive", "Monitoring"],
    actions: ["view_dashboard", "create_pr", "manage_po", "manage_receive", "view_monitoring"]
  },
  WAREHOUSE: {
    menus: ["Dashboard", "Receive", "Monitoring"],
    actions: ["view_dashboard", "manage_receive", "view_monitoring"]
  },
  FINANCE: {
    menus: ["Dashboard", "Invoice", "Payment", "Monitoring"],
    actions: ["view_dashboard", "manage_invoice", "manage_payment", "view_monitoring"]
  }
};

function getRoleAccessRules() {
  return ROLE_ACCESS_RULES;
}

function getRoleMenus(roleCode) {
  const normalized = normalizeRoleCode(roleCode);
  return ROLE_ACCESS_RULES[normalized]?.menus || [];
}

function canRolePerform(roleCode, action) {
  const normalized = normalizeRoleCode(roleCode);
  return ROLE_ACCESS_RULES[normalized]?.actions?.includes(action) || false;
}

function getDbRoles() {
  return Repository.getAll(CONFIG.SHEET.ROLE);
}

function getUserRoles() {
  return Repository.getAll(CONFIG.SHEET.USER_ROLE);
}

function getUsers() {
  return Repository.getAll(CONFIG.SHEET.USER);
}

function findRole(candidate) {
  const roles = getDbRoles();
  const value = String(candidate || "").trim();
  const upper = value.toUpperCase();
  
  let role = roles.find(r => String(r.role_id || "").trim().toUpperCase() === upper);
  if (role) return role;

  role = roles.find(r => String(r.role_code || "").trim().toUpperCase() === upper);
  if (role) return role;

  const normalized = upper.replace(/[^A-Z0-9]/g, "");
  return roles.find(r => String(r.role_code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") === normalized);
}

function validateUserRoleMapping() {
  const users = getUsers();
  const roles = getDbRoles();
  const userRoles = getUserRoles();

  const roleById = {};
  const roleByCode = {};
  roles.forEach(role => {
    const id = String(role.role_id || "").trim();
    const code = String(role.role_code || "").trim().toUpperCase();
    if (id) roleById[id] = role;
    if (code) roleByCode[code] = role;
  });

  const usersById = {};
  users.forEach(user => {
    usersById[String(user.user_id || "").trim()] = user;
  });

  const userRoleGroups = {};
  userRoles.forEach(userRole => {
    const userId = String(userRole.user_id || "").trim();
    if (!userRoleGroups[userId]) userRoleGroups[userId] = [];
    userRoleGroups[userId].push(userRole);
  });

  const missingUserRole = users
    .filter(user => !userRoleGroups[String(user.user_id || "").trim()])
    .map(user => ({
      user_id: user.user_id,
      username: user.username,
      employee_id: user.employee_id
    }));

  const duplicateUserRole = Object.entries(userRoleGroups)
    .filter(([_, entries]) => entries.length > 1)
    .map(([user_id, entries]) => ({
      user_id,
      username: usersById[user_id]?.username || "",
      employee_id: usersById[user_id]?.employee_id || "",
      count: entries.length,
      entries
    }));

  const orphanUserRole = userRoles
    .filter(userRole => !usersById[String(userRole.user_id || "").trim()])
    .map(userRole => ({
      user_role_id: userRole.user_role_id,
      user_id: userRole.user_id,
      role_id: userRole.role_id,
      is_active: userRole.is_active
    }));

  const invalidRoleReferences = userRoles
    .filter(userRole => {
      const candidate = String(userRole.role_id || userRole.role_code || userRole.role || "").trim();
      if (!candidate) return true;
      return !roleById[candidate] && !roleByCode[candidate.toUpperCase()];
    })
    .map(userRole => ({
      user_role_id: userRole.user_role_id,
      user_id: userRole.user_id,
      role_id: userRole.role_id,
      raw_value: String(userRole.role_id || userRole.role_code || userRole.role || "").trim()
    }));

  const userRoleSummaries = userRoles.map(userRole => {
    const candidate = String(userRole.role_id || userRole.role_code || userRole.role || "").trim();
    const role = roleById[candidate] || roleByCode[candidate.toUpperCase()];
    const normalized = normalizeRoleCode(candidate);

    return {
      user_role_id: userRole.user_role_id,
      user_id: userRole.user_id,
      raw_role_id: userRole.role_id,
      raw_role_code: userRole.role_code || null,
      resolved_role_id: role?.role_id || null,
      resolved_role_code: role?.role_code || null,
      resolved_role_name: role?.role_name || null,
      normalized_role_code: normalized
    };
  });

  return {
    summary: {
      users: users.length,
      roles: roles.length,
      userRoles: userRoles.length,
      missingUserRole: missingUserRole.length,
      duplicateUserRole: duplicateUserRole.length,
      orphanUserRole: orphanUserRole.length,
      invalidRoleReferences: invalidRoleReferences.length
    },
    missingUserRole,
    duplicateUserRole,
    orphanUserRole,
    invalidRoleReferences,
    userRoleSummaries
  };
}

function normalizeRoleCode(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return null;

  const map = {
    SUPER_ADMIN: CONFIG.ROLE.SUPERADMIN,
    SUPERADMIN: CONFIG.ROLE.SUPERADMIN,
    ADMIN: CONFIG.ROLE.ADMIN,
    REQUESTER: CONFIG.ROLE.REQUESTER,
    GA: CONFIG.ROLE.GA_VERIFY,
    GA_VERIFY: CONFIG.ROLE.GA_VERIFY,
    FAT_VERIFY: CONFIG.ROLE.FAT,
    FAT: CONFIG.ROLE.FAT,
    IA_VERIFY: CONFIG.ROLE.IA,
    IA: CONFIG.ROLE.IA,
    PROCUREMENT: CONFIG.ROLE.PROCUREMENT,
    WAREHOUSE: CONFIG.ROLE.WAREHOUSE,
    FINANCE: CONFIG.ROLE.FINANCE
  };

  const upper = value.toUpperCase();
  if (map[upper]) return map[upper];

  const normalized = upper.replace(/[^A-Z0-9]/g, "");
  for (const k in map) {
    if (k.replace(/[^A-Z0-9]/g, "") === normalized) return map[k];
  }

  return value;
}

function fixInvalidRoleReferences() {
  const audit = validateUserRoleMapping();
  const updated = [];

  audit.invalidRoleReferences.forEach(entry => {
    const candidate = String(entry.raw_value || "").trim();
    const role = findRole(candidate);
    if (role) {
      Repository.update(CONFIG.SHEET.USER_ROLE, entry.user_role_id, { role_id: role.role_id });
      updated.push({
        user_role_id: entry.user_role_id,
        user_id: entry.user_id,
        old_value: entry.raw_value,
        new_role_id: role.role_id,
        new_role_code: role.role_code
      });
    }
  });

  return {
    fixed: updated.length,
    updated
  };
}

function fixMissingUserRoles(defaultRoleCode) {
  defaultRoleCode = String(defaultRoleCode || CONFIG.ROLE.REQUESTER).trim();
  const users = getUsers();
  const userRoles = getUserRoles();
  const missingUsers = validateUserRoleMapping().missingUserRole;
  const role = findRole(defaultRoleCode);

  if (!role) {
    throw new Error("Role default tidak ditemukan: " + defaultRoleCode);
  }

  const created = [];
  missingUsers.forEach(user => {
    const newUserRole = {
      user_role_id: Utilities.getUuid(),
      user_id: user.user_id,
      role_id: role.role_id,
      is_active: true,
      created_at: new Date()
    };
    Repository.insert(CONFIG.SHEET.USER_ROLE, newUserRole);
    created.push(newUserRole);
  });

  return {
    defaultRole: role.role_code,
    created: created.length,
    entries: created
  };
}

function syncUserRoleToUserTable() {
  const userRoles = getUserRoles();
  const users = getUsers();
  const usersById = {};
  users.forEach(user => {
    usersById[String(user.user_id || "").trim()] = user;
  });

  const grouped = {};
  userRoles.forEach(userRole => {
    const userId = String(userRole.user_id || "").trim();
    if (!grouped[userId]) grouped[userId] = [];
    grouped[userId].push(userRole);
  });

  const updates = [];
  Object.entries(grouped).forEach(([userId, entries]) => {
    const user = usersById[userId];
    if (!user) return;
    const entry = entries[0];
    const candidate = String(entry.role_id || entry.role_code || entry.role || "").trim();
    const role = findRole(candidate);
    const normalized = normalizeRoleCode(role?.role_code || candidate);
    if (normalized && normalized !== String(user.role_code || "").trim()) {
      Repository.update(CONFIG.SHEET.USER, userId, { role_code: normalized });
      updates.push({ user_id: userId, username: user.username, role_code: normalized });
    }
  });

  return {
    updated: updates.length,
    entries: updates
  };
}

function fixAllUserRoleIssues(defaultRoleCode) {
  const invalidFix = fixInvalidRoleReferences();
  const missingFix = fixMissingUserRoles(defaultRoleCode || CONFIG.ROLE.REQUESTER);
  const syncFix = syncUserRoleToUserTable();

  return {
    invalidFix,
    missingFix,
    syncFix
  };
}

function logUserRoleAudit() {
  const audit = validateUserRoleMapping();
  Logger.log(JSON.stringify(audit, null, 2));
  return audit;
}
