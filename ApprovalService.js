class ApprovalService {

  static createApproval(
    documentType,
    documentId,
    approverId,
    sequence
  ){

    const sheet =
      Repository.getSheet(
        "80_T_APPROVAL"
      );

    sheet.appendRow([
      Utilities.getUuid(),
      documentType,
      documentId,
      sequence,
      approverId,
      "PENDING",
      "",
      ""
    ]);

  }

  static approve(
    approvalId,
    remarks=""
  ){

    this.updateApproval(
      approvalId,
      "APPROVED",
      remarks
    );

  }

  static reject(
    approvalId,
    remarks=""
  ){

    this.updateApproval(
      approvalId,
      "REJECTED",
      remarks
    );

  }

  static returnDoc(
    approvalId,
    remarks=""
  ){

    this.updateApproval(
      approvalId,
      "RETURNED",
      remarks
    );

  }

  static updateApproval(
    approvalId,
    status,
    remarks
  ){

    const sheet =
      Repository.getSheet(
        "80_T_APPROVAL"
      );

    const data =
      sheet.getDataRange().getValues();

    for(let i=1;i<data.length;i++){

      if(data[i][0] == approvalId){

        sheet.getRange(i+1,6)
          .setValue(status);

        sheet.getRange(i+1,7)
          .setValue(remarks);

        sheet.getRange(i+1,8)
          .setValue(new Date());

        break;
      }

    }

  }

}