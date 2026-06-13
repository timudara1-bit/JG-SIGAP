class NumberingService {

  static getRomanMonth(month) {

    const roman = [
      "I","II","III","IV","V","VI",
      "VII","VIII","IX","X","XI","XII"
    ];

    return roman[month - 1];
  }

  static getNextNumber(docType, dept = "") {

    const sheet = Repository.getSheet(CONFIG.SHEET.NUMBERING);

    const data = sheet.getDataRange().getValues();

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    for(let i = 1; i < data.length; i++){

      if(
        data[i][0] === docType &&
        data[i][1] == year &&
        data[i][2] == month &&
        data[i][3] === dept
      ){

        let nextNo = Number(data[i][4]) + 1;

        sheet.getRange(i + 1,5).setValue(nextNo);

        return nextNo;
      }
    }

    sheet.appendRow([
      docType,
      year,
      month,
      dept,
      1
    ]);

    return 1;
  }

  static generateFPBNumber(deptCode, unitCode="JG") {

    const runningNo = this.getNextNumber(
      "FPB",
      deptCode
    );

    return Utilities.formatString(
      "%03d/%s/%s/%s/%s",
      runningNo,
      deptCode,
      unitCode,
      this.getRomanMonth(new Date().getMonth()+1),
      new Date().getFullYear()
    );
  }

  static generatePPNumber() {

    const no = this.getNextNumber("PP");

    return `PP/${Utilities.formatString("%03d",no)}/JG/${this.getRomanMonth(new Date().getMonth()+1)}/${new Date().getFullYear()}`;
  }

  static generatePRNumber() {

    const no = this.getNextNumber("PR");

    return `PR/${Utilities.formatString("%03d",no)}/JG/${this.getRomanMonth(new Date().getMonth()+1)}/${new Date().getFullYear()}`;
  }

  static generatePONumber() {

    const no = this.getNextNumber("PO");

    return `PO/${Utilities.formatString("%03d",no)}/JG/${this.getRomanMonth(new Date().getMonth()+1)}/${new Date().getFullYear()}`;
  }

  static generateInvoiceNumber() {

    const no = this.getNextNumber("INV");

    return `INV/${Utilities.formatString("%03d",no)}/JG/${this.getRomanMonth(new Date().getMonth()+1)}/${new Date().getFullYear()}`;
  }

  static generatePaymentNumber() {

    const no = this.getNextNumber("PAY");

    return `PAY/${Utilities.formatString("%03d",no)}/JG/${this.getRomanMonth(new Date().getMonth()+1)}/${new Date().getFullYear()}`;
  }

}