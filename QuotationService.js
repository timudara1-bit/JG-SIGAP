class QuotationService {

  static upload(
    fpbId,
    fileName,
    mimeType,
    base64Data
  ){

    const folderId =
      CONFIG.FOLDER.QUOTATION;

    const folder =
      DriveApp.getFolderById(
        folderId
      );

    const blob =
      Utilities.newBlob(
        Utilities.base64Decode(
          base64Data
        ),
        mimeType,
        fileName
      );

    const file =
      folder.createFile(blob);

    QuotationRepository.save({

      quotation_id:
        Utilities.getUuid(),

      fpb_id:
        fpbId,

      vendor_id:
        "",

      quotation_no:
        "",

      quotation_date:
        new Date(),

      quotation_value:
        0,

      selected_vendor:
        false,

      file_url:
        file.getUrl()

    });

    return file.getUrl();

  }

}