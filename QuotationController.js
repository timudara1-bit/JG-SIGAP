function uploadQuotationController(
  fpbId,
  fileName,
  mimeType,
  base64Data
){

  return QuotationService.upload(
    fpbId,
    fileName,
    mimeType,
    base64Data
  );

}