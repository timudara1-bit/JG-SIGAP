/**
 * ReceiveInvoicePaymentService
 * Manages Receive, Invoice, and Payment operations with role-based access control.
 */

class ReceiveInvoicePaymentService {

  /**
   * Create a new Receive record
   */
  static createReceive(receiveData) {
    assertRoleCan("manage_receive");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.RECEIVE_HEADER);
    
    const newRow = [
      this.generateReceiveNumber(),
      receiveData.supplier_id || "",
      receiveData.po_id || "",
      new Date(),
      receiveData.receive_date || new Date(),
      receiveData.notes || "",
      "DRAFT",
      new Date(),
      SessionService.getSession().user_id
    ];

    sheet.appendRow(newRow);
  }

  /**
   * Update an existing Receive record
   */
  static updateReceive(receiveId, receiveData) {
    assertRoleCan("manage_receive");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.RECEIVE_HEADER);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idIndex = headers.indexOf("receive_id") + 1;
    
    if (!idIndex) throw new Error("receive_id column not found");

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex - 1] === receiveId) {
        sheet.getRange(i + 1, 1, 1, receiveData.length)
          .setValues([Object.values(receiveData)]);
        break;
      }
    }
  }

  /**
   * Approve a Receive record (transition to APPROVED)
   */
  static approveReceive(receiveId, remarks = "") {
    assertRoleCan("manage_receive");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.RECEIVE_HEADER);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const statusIndex = headers.indexOf("status") + 1;
    
    if (!statusIndex) throw new Error("status column not found");

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === receiveId) {
        sheet.getRange(i + 1, statusIndex).setValue("APPROVED");
        break;
      }
    }
  }

  /**
   * Create a new Invoice record
   */
  static createInvoice(invoiceData) {
    assertRoleCan("manage_invoice");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.INVOICE_HEADER);
    
    const newRow = [
      this.generateInvoiceNumber(),
      invoiceData.supplier_id || "",
      invoiceData.receive_id || "",
      new Date(),
      invoiceData.invoice_date || new Date(),
      parseFloat(invoiceData.total_amount || 0),
      invoiceData.notes || "",
      "DRAFT",
      new Date(),
      SessionService.getSession().user_id
    ];

    sheet.appendRow(newRow);
  }

  /**
   * Update an existing Invoice record
   */
  static updateInvoice(invoiceId, invoiceData) {
    assertRoleCan("manage_invoice");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.INVOICE_HEADER);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idIndex = headers.indexOf("invoice_id") + 1;
    
    if (!idIndex) throw new Error("invoice_id column not found");

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex - 1] === invoiceId) {
        sheet.getRange(i + 1, 1, 1, invoiceData.length)
          .setValues([Object.values(invoiceData)]);
        break;
      }
    }
  }

  /**
   * Approve an Invoice record (transition to APPROVED)
   */
  static approveInvoice(invoiceId, remarks = "") {
    assertRoleCan("manage_invoice");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.INVOICE_HEADER);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const statusIndex = headers.indexOf("status") + 1;
    
    if (!statusIndex) throw new Error("status column not found");

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === invoiceId) {
        sheet.getRange(i + 1, statusIndex).setValue("APPROVED");
        break;
      }
    }
  }

  /**
   * Create a new Payment record
   */
  static createPayment(paymentData) {
    assertRoleCan("manage_payment");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.PAYMENT_HEADER);
    
    const newRow = [
      this.generatePaymentNumber(),
      paymentData.invoice_id || "",
      paymentData.supplier_id || "",
      new Date(),
      paymentData.payment_date || new Date(),
      parseFloat(paymentData.payment_amount || 0),
      paymentData.payment_method || "TRANSFER",
      paymentData.notes || "",
      "DRAFT",
      new Date(),
      SessionService.getSession().user_id
    ];

    sheet.appendRow(newRow);
  }

  /**
   * Update an existing Payment record
   */
  static updatePayment(paymentId, paymentData) {
    assertRoleCan("manage_payment");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.PAYMENT_HEADER);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idIndex = headers.indexOf("payment_id") + 1;
    
    if (!idIndex) throw new Error("payment_id column not found");

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex - 1] === paymentId) {
        sheet.getRange(i + 1, 1, 1, paymentData.length)
          .setValues([Object.values(paymentData)]);
        break;
      }
    }
  }

  /**
   * Approve a Payment record (transition to APPROVED)
   */
  static approvePayment(paymentId, remarks = "") {
    assertRoleCan("manage_payment");

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(CONFIG.SHEET.PAYMENT_HEADER);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const statusIndex = headers.indexOf("status") + 1;
    
    if (!statusIndex) throw new Error("status column not found");

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === paymentId) {
        sheet.getRange(i + 1, statusIndex).setValue("APPROVED");
        break;
      }
    }
  }

  /**
   * Generate a unique Receive Number
   */
  static generateReceiveNumber() {
    return NumberingService.generateReceiveNumber?.() || `RCP-${Date.now()}`;
  }

  /**
   * Generate a unique Invoice Number
   */
  static generateInvoiceNumber() {
    return NumberingService.generateInvoiceNumber?.() || `INV-${Date.now()}`;
  }

  /**
   * Generate a unique Payment Number
   */
  static generatePaymentNumber() {
    return NumberingService.generatePaymentNumber?.() || `PAY-${Date.now()}`;
  }

}
