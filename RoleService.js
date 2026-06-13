class RoleService {

  static getRoleMenus() {

    return {

      REQUESTER: [
        "Dashboard",
        "Buat FPB",
        "FPB Saya"
      ],

      GA_VERIFY: [
        "Dashboard",
        "Verifikasi FPB",
        "Monitoring"
      ],

      GA_PP: [
        "Dashboard",
        "PP Draft",
        "Monitoring"
      ],

      FAT: [
        "Dashboard",
        "Approval PP"
      ],

      IA: [
        "Dashboard",
        "Approval PP"
      ],

      PROCUREMENT: [
        "Dashboard",
        "PR",
        "PO",
        "Receive",
        "Monitoring"
      ],

      WAREHOUSE: [
        "Dashboard",
        "Receive",
        "Monitoring"
      ],

      FINANCE: [
        "Dashboard",
        "Invoice",
        "Payment",
        "Monitoring"
      ],

      ADMIN: [
        "Dashboard",
        "Master User",
        "Master Vendor",
        "Approval Matrix",
        "SLA",
        "System Setting"
      ],

      SUPERADMIN: [
        "Dashboard",
        "Master User",
        "Master Vendor",
        "Approval Matrix",
        "SLA",
        "System Setting"
      ]

    };

  }

  static getMenuByRole(roleCode){

    const menus = this.getRoleMenus();

    return menus[roleCode] || [];

  }

  static hasAccess(roleCode, menuName){

    return this
      .getMenuByRole(roleCode)
      .includes(menuName);

  }

}