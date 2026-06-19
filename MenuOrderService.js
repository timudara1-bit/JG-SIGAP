function syncMenuOrderV5() { return MenuOrderService.syncV5(); }
class MenuOrderService {
  static syncV5() {
    const menus = [
      ["MENU001","dashboard","Dashboard","","dashboard","🏠",1,"DASHBOARD"],
      ["MENU014","monitoring","Monitoring","","monitoring","📊",10,"MONITORING"],
      ["MENU015","sla","SLA Monitoring","","sla","⏱️",11,"MONITORING"],
      ["MENU017","flow-timeline","Flow Timeline","","flow-timeline","🔗",12,"MONITORING"],
      ["MENU018","my-task","My Task","","my-task","✅",13,"MONITORING"],
      ["MENU019","laporan","Laporan","","laporan","📑",20,"LAPORAN"],
      ["MENU002","fpb","FPB","","fpb","📋",30,"PENGADAAN"],
      ["MENU_QUOTATION","quotation","Quotation","","quotation","💰",31,"PENGADAAN"],
      ["MENU003","underlying","Underlying","","underlying","🧾",32,"PENGADAAN"],
      ["MENU004","verifikasi-ga","Verifikasi GA","","verifikasi-ga","✅",33,"PENGADAAN"],
      ["MENU005","pp","PP","","pp","📄",34,"PENGADAAN"],
      ["MENU006","verifikasi-fat","Verifikasi FAT","","verifikasi-fat","🛡️",35,"PENGADAAN"],
      ["MENU007","verifikasi-ia","Verifikasi IA","","verifikasi-ia","🔎",36,"PENGADAAN"],
      ["MENU008","pp-approve","PP Approve","","pp-approve","☑️",37,"PENGADAAN"],
      ["MENU009","pr","PR","","pr","📝",40,"PROSES"],
      ["MENU010","po","PO","","po","📦",41,"PROSES"],
      ["MENU011","receive","Receive","","receive","📥",42,"PROSES"],
      ["MENU012","invoice","Invoice / SPD","","invoice","🧾",43,"PROSES"],
      ["MENU013","payment","Payment","","payment","💳",44,"PROSES"],
      ["MENU_PENGHAPUSAN","penghapusan","Penghapusan","","penghapusan","🗑️",45,"PROSES"],
      ["MENU_LOADER","loader","Loader","","loader","⬆️",46,"PROSES"],
      ["MENU020","data-master","Data Master","","data-master","🗄️",50,"MASTER DATA"],
      ["MENU021","management-user","Management User","","management-user","👥",51,"MASTER DATA"],
      ["MENU022","management-role","Management Role","","management-role","🔐",52,"MASTER DATA"],
      ["MENU023","management-menu","Management Menu","","management-menu","🧭",53,"MASTER DATA"],
      ["MENU024","approval-matrix","Approval Matrix","","approval-matrix","🧩",54,"MASTER DATA"],
      ["MENU025","settings","Settings","","settings","⚙️",60,"SETTINGS"]
    ];
    if (!Repository.exists(CONFIG.SHEET.MENU)) return { success:false, message:"Sheet menu tidak ditemukan" };
    const headers = Repository.headers(CONFIG.SHEET.MENU);
    const key = headers.indexOf("menu_id") !== -1 ? "menu_id" : headers[0];
    menus.forEach(m => Repository.upsert(CONFIG.SHEET.MENU, key, this.cleanByHeaders_({ menu_id:m[0], menu_code:m[1], menu_name:m[2], parent_menu_id:m[3], page_key:m[4], icon:m[5], sort_order:m[6], menu_group:m[7], group_name:m[7], is_active:1, created_at:new Date(), updated_at:new Date() }, headers)));
    return { success:true, message:"Susunan menu V5 berhasil disinkronkan.", total:menus.length };
  }
  static cleanByHeaders_(data, headers) { const out={}; headers.forEach(h => { if (data[h] !== undefined) out[h]=data[h]; }); return out; }
}
