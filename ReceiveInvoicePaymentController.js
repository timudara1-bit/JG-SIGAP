/**
 * ReceiveInvoicePaymentController
 * Exposes receive, invoice, and payment operations as Apps Script global functions
 * protected by role-based access control
 */

// ============ RECEIVE OPERATIONS ============

function createReceiveController(receiveData) {
  try {
    ReceiveInvoicePaymentService.createReceive(receiveData);
    return {
      success: true,
      message: "Receive created successfully"
    };
  } catch (error) {
    Logger.log("createReceiveController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function updateReceiveController(receiveId, receiveData) {
  try {
    ReceiveInvoicePaymentService.updateReceive(receiveId, receiveData);
    return {
      success: true,
      message: "Receive updated successfully"
    };
  } catch (error) {
    Logger.log("updateReceiveController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function approveReceiveController(receiveId, remarks) {
  try {
    ReceiveInvoicePaymentService.approveReceive(receiveId, remarks);
    return {
      success: true,
      message: "Receive approved successfully"
    };
  } catch (error) {
    Logger.log("approveReceiveController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ INVOICE OPERATIONS ============

function createInvoiceController(invoiceData) {
  try {
    ReceiveInvoicePaymentService.createInvoice(invoiceData);
    return {
      success: true,
      message: "Invoice created successfully"
    };
  } catch (error) {
    Logger.log("createInvoiceController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function updateInvoiceController(invoiceId, invoiceData) {
  try {
    ReceiveInvoicePaymentService.updateInvoice(invoiceId, invoiceData);
    return {
      success: true,
      message: "Invoice updated successfully"
    };
  } catch (error) {
    Logger.log("updateInvoiceController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function approveInvoiceController(invoiceId, remarks) {
  try {
    ReceiveInvoicePaymentService.approveInvoice(invoiceId, remarks);
    return {
      success: true,
      message: "Invoice approved successfully"
    };
  } catch (error) {
    Logger.log("approveInvoiceController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ PAYMENT OPERATIONS ============

function createPaymentController(paymentData) {
  try {
    ReceiveInvoicePaymentService.createPayment(paymentData);
    return {
      success: true,
      message: "Payment created successfully"
    };
  } catch (error) {
    Logger.log("createPaymentController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function updatePaymentController(paymentId, paymentData) {
  try {
    ReceiveInvoicePaymentService.updatePayment(paymentId, paymentData);
    return {
      success: true,
      message: "Payment updated successfully"
    };
  } catch (error) {
    Logger.log("updatePaymentController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function approvePaymentController(paymentId, remarks) {
  try {
    ReceiveInvoicePaymentService.approvePayment(paymentId, remarks);
    return {
      success: true,
      message: "Payment approved successfully"
    };
  } catch (error) {
    Logger.log("approvePaymentController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
