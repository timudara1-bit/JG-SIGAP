class ApiController {
  static handle(action, payload, token) {
    try {
      const publicActions = ["login", "logout", "ping"];
      let session = null;

      if (publicActions.indexOf(action) === -1) {
        session = SessionService.validate(token);
        if (!session.success) return { success: false, code: "UNAUTHORIZED", message: session.message };
      }

      const user = session ? session.user : null;

      switch (action) {
        case "ping": return { success: true, message: "pong", version: CONFIG.APP.VERSION };
        case "login": return AuthService.login(payload.username, payload.password);
        case "logout": return SessionService.logout(token);

        case "getAppState": return AppService.getAppState(user);
        case "getDashboard": return DashboardService.getDashboardData(payload, user);
        case "getMonitoring": return DashboardService.getMonitoringData(payload, user);
        case "getMasterData": return MasterDataService.getMasterData(payload, user);
        case "saveMasterData": return MasterDataService.saveMasterData(payload, user);
        case "deleteMasterData": return MasterDataService.deleteMasterData(payload, user);

        case "getModuleList": return ModuleService.getModuleList(payload, user);
        case "getDocument": return ModuleService.getDocument(payload, user);
        case "saveDocument": return ModuleService.saveDocument(payload, user);
        case "submitDocument": return ModuleService.submitDocument(payload, user);
        case "selectLowestQuotation": return QuotationService.selectLowest(payload, user);
        case "createUnderlyingFromQuotation": return QuotationService.createUnderlyingFromQuotation(payload, user);
        case "workflowAction": return WorkflowService.action(payload, user);

        case "getMyTasks": return TaskService.getMyTasks(payload, user);
        case "updateTask": return TaskService.updateTask(payload, user);


        case "getProfile": return ProfileService.getProfile(user);
        case "updateProfilePhoto": return ProfileService.updateProfilePhoto(payload, user);
        case "getNotifications": return NotificationService.getNotifications(payload, user);
        case "markNotificationRead": return NotificationService.markRead(payload, user);
        case "sendPendingNotifications": return NotificationService.sendPending();

        case "runSlaCheck": return SlaService.checkWarningAndOverdue(user);
        case "importData": return LoaderService.importData(payload, user);

        case "debugUserManagement": return UserManagementService.debugCounts(payload, user);

        case "getFPBInit": return FPBService.getInitData(payload, user);
        case "searchFPBRequester": return FPBService.searchEmployees(payload, user);
        case "previewFPBNo": return FPBService.previewNumber(payload, user);
        case "listFPB": return FPBService.list(payload, user);
        case "getFPBDetail": return FPBService.getDetail(payload, user);
        case "createFPB": return FPBService.create(payload, user);
        case "saveEmployeeEsignV95": return saveEmployeeEsignDirectV97(payload);
        case "saveEmployeeEsignV97": return saveEmployeeEsignDirectV97(payload);
        case "getEmployeeEsignV95": return getEmployeeEsignDirectV88(payload);
        case "debugEmployeeEsignV95": return debugEmployeeEsignDirectV94();
        case "getUserManagementInit": return UserManagementService.getInitData(payload, user);
        case "searchEmployeesForUser": return UserManagementService.searchEmployees(payload, user);
        case "listUsers": return UserManagementService.listUsers(payload, user);
        case "createUser": return UserManagementService.createUser(payload, user);
        case "getLoaderConfig": return LoaderConfigService.getConfig(payload, user);
        case "syncLoaderConfig": return LoaderConfigService.syncDefault();
        case "getLoaderTemplate": return LoaderImportService.getTemplate(payload, user);
        case "validateLoaderFile": return LoaderImportService.validateFile(payload, user);
        case "importLoaderData": return LoaderImportService.importData(payload, user);

        
        case "fpbListDirectV79": return fpbListDirectV79(payload);
        case "fpbDetailDirectV83": return fpbDetailDirectV83(payload);
        case "fpbInitDirectV79": return fpbInitDirectV79(payload);
        case "fpbCreateDirectV79": return fpbCreateDirectV79(payload);
        case "fpbSearchRequesterDirectV79": return fpbSearchRequesterDirectV79(payload);
        case "fpbPreviewNoDirectV79": return fpbPreviewNoDirectV79(payload);
        default: return { success: false, message: "Action tidak dikenal: " + action };
      }
    } catch (err) {
      Logger.log("API ERROR [" + action + "]: " + err.stack);
      return { success: false, message: err.message };
    }
  }
}

class AppService {
  static getAppState(user) {
    return {
      success: true,
      user,
      menu: RoleMenuService.getMenu(user),
      config: {
        appName: CONFIG.APP.NAME,
        version: CONFIG.APP.VERSION,
        defaultPage: CONFIG.APP.DEFAULT_PAGE
      },
      lookups: LookupService.getAll()
    };
  }
}



/*************************************************
 * API CONTROLLER FPB COMPAT PATCH - V7.6
 * Menangani action FPB secara paksa agar tidak return null.
 *************************************************/
function __handleFPBActionsV76(action, payload, user) {
  payload = payload || {};
  user = user || { user_id: "SYSTEM" };

  switch (action) {
    case "getFPBInit":
      return FPBService.getInitData(payload, user);
    case "listFPB":
      return FPBService.list(payload, user);
    case "createFPB":
      return FPBService.create(payload, user);
    case "searchFPBRequester":
      return FPBService.searchEmployees(payload, user);
    case "previewFPBNo":
      return FPBService.previewNumber(payload, user);
    default:
      return null;
  }
}

function apiFPBTestV76() {
  const result = __handleFPBActionsV76("listFPB", {}, { user_id: "TEST" });
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
