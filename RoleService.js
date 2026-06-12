class RoleService {

  static getRoleMenus() {

    return {

      USER: [
        "Dashboard",
        "Buat FPB",
        "FPB Saya"
      ],

      GA_VERIFY: [
        "Dashboard",
        "Verifikasi FPB",
        "Create PP",
        "Monitoring"
      ],

      GA_INVOICE: [
        "Dashboard",
        "Verifikasi FPB",
        "Invoice",
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

      SCM: [
        "Dashboard",
        "PR",
        "PO",
        "Received"
      ],

      FINANCE: [
        "Dashboard",
        "Invoice",
        "Payment"
      ],

      ADMIN: [
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