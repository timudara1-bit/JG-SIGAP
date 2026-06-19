class Router {
  static getPage(pageKey, isPublic, user) {
    pageKey = pageKey || CONFIG.APP.DEFAULT_PAGE;
    const page = CONFIG.PAGE[pageKey] || CONFIG.PAGE["not-found"];

    if (!isPublic && page.public) {
      return { success: true, pageKey, title: page.title, html: include(page.file) };
    }

    if (!isPublic && !page.public && user) {
      // RoleMenuService can be tightened later.
      const allowed = RoleMenuService.canView(user, pageKey);
      if (!allowed) {
        const denied = CONFIG.PAGE["access-denied"];
        return { success: false, code: "ACCESS_DENIED", pageKey, title: denied.title, html: include(denied.file) };
      }
    }

    return { success: true, pageKey, title: page.title, html: include(page.file) };
  }
}
