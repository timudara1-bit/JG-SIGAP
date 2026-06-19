/*************************************************
 * MENU MANAGEMENT SERVICE
 * JG-SIGAP V3
 * Menyimpan dan mensinkronkan data menu ke:
 * - 15_M_MENU
 * - 16_M_ROLE_MENU
 *************************************************/

function syncDefaultMenuToDatabase() {
  return MenuManagementService.syncDefaultMenu();
}

class MenuManagementService {
  static defaultMenus() {
    return [
      ["MENU001", "dashboard", "Dashboard", "", "dashboard", "🏠", 1],
      ["MENU002", "fpb", "FPB", "", "fpb", "📋", 2],
      ["MENU003", "underlying", "Underlying", "", "underlying", "🧾", 3],
      ["MENU004", "verifikasi-ga", "Verifikasi GA", "", "verifikasi-ga", "✅", 4],
      ["MENU005", "pp", "PP", "", "pp", "📄", 5],
      ["MENU006", "verifikasi-fat", "Verifikasi FAT", "", "verifikasi-fat", "🛡️", 6],
      ["MENU007", "verifikasi-ia", "Verifikasi IA", "", "verifikasi-ia", "🔎", 7],
      ["MENU008", "pp-approve", "PP Approve", "", "pp-approve", "☑️", 8],
      ["MENU009", "pr", "PR", "", "pr", "📝", 9],
      ["MENU010", "po", "PO", "", "po", "📦", 10],
      ["MENU011", "receive", "Receive", "", "receive", "📥", 11],
      ["MENU012", "invoice", "Invoice / SPD", "", "invoice", "🧾", 12],
      ["MENU013", "payment", "Payment", "", "payment", "💳", 13],
      ["MENU014", "loader", "Loader", "", "loader", "⬆️", 14],
      ["MENU015", "monitoring", "Monitoring", "", "monitoring", "📊", 15],
      ["MENU016", "sla", "SLA Monitoring", "", "sla", "⏱️", 16],
      ["MENU017", "flow-timeline", "Flow Timeline", "", "flow-timeline", "🔗", 17],
      ["MENU018", "my-task", "My Task", "", "my-task", "✅", 18],
      ["MENU019", "laporan", "Laporan", "", "laporan", "📑", 19],
      ["MENU020", "data-master", "Data Master", "", "data-master", "🗄️", 20],
      ["MENU021", "management-user", "Management User", "", "management-user", "👥", 21],
      ["MENU022", "management-role", "Management Role", "", "management-role", "🔐", 22],
      ["MENU023", "management-menu", "Management Menu", "", "management-menu", "🧭", 23],
      ["MENU024", "approval-matrix", "Approval Matrix", "", "approval-matrix", "🧩", 24],
      ["MENU025", "settings", "Settings", "", "settings", "⚙️", 25]
    ];
  }

  static syncDefaultMenu() {
    const menus = this.defaultMenus();
    let inserted = 0;
    menus.forEach(function (m) {
      Repository.upsert(CONFIG.SHEET.MENU, "menu_id", {
        menu_id: m[0],
        menu_code: m[1],
        menu_name: m[2],
        parent_menu_id: m[3],
        page_key: m[4],
        icon: m[5],
        sort_order: m[6],
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      inserted++;
    });
    return { success: true, message: "Default menu berhasil disinkronkan", total: inserted };
  }
}
