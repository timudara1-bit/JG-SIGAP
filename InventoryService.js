class InventoryService {

  static getItems(){

    return Repository.findAll(
      CONFIG.SHEET.MST_BARANG
    );

  }

}