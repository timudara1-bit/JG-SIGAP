class LookupService {
  static getAll() {
    return {
      departments: Repository.safeGetAll(CONFIG.SHEET.DEPARTMENT),
      employees: Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE),
      roles: Repository.safeGetAll(CONFIG.SHEET.ROLE),
      priorities: Repository.safeGetAll(CONFIG.SHEET.PRIORITY),
      vendors: Repository.safeGetAll(CONFIG.SHEET.VENDOR),
      companies: Repository.safeGetAll(CONFIG.SHEET.COMPANY),
      sites: Repository.safeGetAll(CONFIG.SHEET.SITE),
      costCenters: Repository.safeGetAll(CONFIG.SHEET.COST_CENTER),
      locations: Repository.safeGetAll(CONFIG.SHEET.LOCATION)
    };
  }
}
