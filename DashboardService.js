class DashboardService {

  static getDashboardData() {

    return {

      fpb: this.getCountByPeriod(
        "10_T_FPB_HEADER",
        3 // kolom tanggal fpb
      ),

      pp: this.getCountByPeriod(
        "20_T_PP_HEADER",
        4
      ),

      pr: this.getCountByPeriod(
        "30_T_PR_HEADER",
        4
      ),

      receive: this.getCountByPeriod(
        "50_T_RECEIVED_HEADER",
        3
      ),

      invoice: this.getCountByPeriod(
        "60_T_INVOICE_HEADER",
        4
      ),

      payment: this.getCountByPeriod(
        "70_T_PAYMENT_HEADER",
        4
      )

    };

  }

  static getCountByPeriod(sheetName,dateColumn){

    const sheet =
      SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(sheetName);

    const data =
      sheet.getDataRange()
      .getValues();

    const rows =
      data.slice(1);

    const now =
      new Date();

    const startToday =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

    const startWeek =
      new Date(startToday);

    startWeek.setDate(
      startToday.getDate() -
      startToday.getDay()
    );

    const startMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    const startYear =
      new Date(
        now.getFullYear(),
        0,
        1
      );

    let result = {

      hari:0,
      minggu:0,
      bulan:0,
      tahun:0,
      total:rows.length

    };

    rows.forEach(row=>{

      const trxDate =
        new Date(
          row[dateColumn - 1]
        );

      if(trxDate >= startToday)
        result.hari++;

      if(trxDate >= startWeek)
        result.minggu++;

      if(trxDate >= startMonth)
        result.bulan++;

      if(trxDate >= startYear)
        result.tahun++;

    });

    return result;

  }

}