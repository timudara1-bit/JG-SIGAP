class QuotationRepository {

  static save(data){

    Repository
      .getSheet(
        "12_T_QUOTATION"
      )
      .appendRow([

        data.quotation_id,
        data.fpb_id,
        data.vendor_id,
        data.quotation_no,
        data.quotation_date,
        data.quotation_value,
        data.selected_vendor,
        data.file_url

      ]);

  }

}