/*************************************************
 * PROFILE SERVICE - HOTFIX V6.1
 *************************************************/
class ProfileService {
  static getProfile(user) {
    if (!user || !user.user_id) return { success: false, message: "Session tidak valid" };
    return { success: true, data: AuthService.getUserProfile(user.user_id) };
  }

  static updateProfilePhoto(payload, user) {
    if (!user || !user.user_id) return { success: false, message: "Session tidak valid" };

    const dataUrl = String(payload.dataUrl || "");
    const fileName = String(payload.fileName || "profile.png").replace(/[^\w.\-]/g, "_");
    const mimeType = String(payload.mimeType || "image/png");

    if (dataUrl.indexOf("base64,") === -1) {
      return { success: false, message: "Data gambar tidak valid" };
    }

    const bytes = Utilities.base64Decode(dataUrl.split("base64,")[1]);
    const blob = Utilities.newBlob(bytes, mimeType, "JG_SIGAP_PROFILE_" + user.user_id + "_" + Date.now() + "_" + fileName);
    const file = DriveApp.createFile(blob);

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (err) {
      Logger.log(err.message);
    }

    const photoUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w300";

    this.ensureColumn_(CONFIG.SHEET.USER, "profile_photo_url");
    this.ensureColumn_(CONFIG.SHEET.EMPLOYEE, "profile_photo_url");

    Repository.update(CONFIG.SHEET.USER, "user_id", user.user_id, {
      profile_photo_url: photoUrl
    });

    const profile = AuthService.getUserProfile(user.user_id);
    if (profile && profile.employee_id) {
      Repository.update(CONFIG.SHEET.EMPLOYEE, "employee_id", profile.employee_id, {
        profile_photo_url: photoUrl
      });
    }

    AuditService.log(user, "UPDATE_PROFILE_PHOTO", "PROFILE", user.user_id, "", { profile_photo_url: photoUrl }, "Ganti foto profile");

    return {
      success: true,
      message: "Foto profile berhasil diperbarui",
      data: {
        profile_photo_url: photoUrl,
        file_id: file.getId(),
        file_url: file.getUrl()
      }
    };
  }

  static ensureColumn_(sheetName, columnName) {
    const sh = Repository.sheet(sheetName);
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim());
    if (headers.indexOf(columnName) !== -1) return;
    sh.getRange(1, lastCol + 1).setValue(columnName);
  }
}
