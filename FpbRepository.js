class FpbRepository {

  static saveHeader(data){

    const sheet =
      Repository.getSheet(
        CONFIG.SHEET.FPB_HEADER
      );

    sheet.appendRow([
      data.fpb_id,
      data.no_fpb,
      data.tanggal_fpb,
      data.requestor_id,
      data.dept_code,
      data.prioritas,
      data.justifikasi,
      data.total_estimasi,
      data.status,
      data.current_step,
      new Date(),
      ""
    ]);

  }

  static saveDetail(items){

    const sheet =
      Repository.getSheet(
        CONFIG.SHEET.FPB_DETAIL
      );

    items.forEach(item=>{

      sheet.appendRow([

        Utilities.getUuid(),

        item.fpb_id,

        item.category_id,

        item.item_name,

        item.specification,

        item.qty,

        item.unit,

        item.price,

        item.qty * item.price,

        "OPEN"

      ]);

    });

  }

  static submitFPB(fpbId,noFPB){

    const sheet =
      Repository.getSheet(
        CONFIG.SHEET.FPB_HEADER
      );

    const data =
      sheet.getDataRange().getValues();

  for(let i=1;i<data.length;i++){

    if(data[i][0] === fpbId){

      sheet.getRange(i+1,2)
        .setValue(noFPB);

      sheet.getRange(i+1,9)
        .setValue("SUBMITTED");

      sheet.getRange(i+1,10)
        .setValue("APPROVAL_L1");

      sheet.getRange(i+1,12)
        .setValue(new Date());

      break;

    }

  }

}

}