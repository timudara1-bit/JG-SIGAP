class RoleMenuService {
  static canView(user, pageKey) {
    if (!user) return false;
    if ((user.roles || []).indexOf("SUPERADMIN") !== -1) return true;
    // Default open for now, menu restriction still DB-driven and can be tightened by 16_M_ROLE_MENU.
    return true;
  }

  static getMenu(user) {
    const menuRows = Repository.safeGetAll(CONFIG.SHEET.MENU).filter(r => isActiveValue(r.is_active));
    if (menuRows.length) return menuRows.sort((a,b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    return [];
  }
}
