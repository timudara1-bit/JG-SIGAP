/*************************************************
 * RESET PASSWORD USER JG-SIGAP
 * Untuk memperbaiki error: Password salah
 *************************************************/

function resetPasswordByUsername() {
  const username = "agil.megiansyah@jhonlingroup.co.id"; // ganti dengan email login
  const newPassword = "ga@123"; // password baru

  const ss = SpreadsheetApp.openById(CONFIG.APP.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET.USER);

  if (!sheet) {
    throw new Error("Sheet 01_M_USER tidak ditemukan");
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const colUserId = headers.indexOf("user_id");
  const colUsername = headers.indexOf("username");
  const colPasswordHash = headers.indexOf("password_hash");
  const colSalt = headers.indexOf("salt");
  const colLoginAttempt = headers.indexOf("login_attempt");
  const colIsActive = headers.indexOf("is_active");
  const colUpdatedAt = headers.indexOf("updated_at");

  if (colUsername === -1 || colPasswordHash === -1 || colSalt === -1) {
    throw new Error(
      "Kolom username / password_hash / salt tidak lengkap di 01_M_USER",
    );
  }

  for (let i = 1; i < values.length; i++) {
    const rowUsername = String(values[i][colUsername] || "").trim();

    if (rowUsername.toLowerCase() === username.toLowerCase()) {
      const salt = Utilities.getUuid();
      const passwordHash = hashPasswordForReset_(newPassword, salt);

      sheet.getRange(i + 1, colPasswordHash + 1).setValue(passwordHash);
      sheet.getRange(i + 1, colSalt + 1).setValue(salt);

      if (colLoginAttempt !== -1) {
        sheet.getRange(i + 1, colLoginAttempt + 1).setValue(0);
      }

      if (colIsActive !== -1) {
        sheet.getRange(i + 1, colIsActive + 1).setValue(1);
      }

      if (colUpdatedAt !== -1) {
        sheet.getRange(i + 1, colUpdatedAt + 1).setValue(new Date());
      }

      Logger.log("Password berhasil direset");
      Logger.log("User ID: " + values[i][colUserId]);
      Logger.log("Username: " + username);
      Logger.log("Password baru: " + newPassword);

      return;
    }
  }

  throw new Error("Username tidak ditemukan: " + username);
}

/**
 * Hash harus sama dengan SecurityService.hashPassword()
 */
function hashPasswordForReset_(password, salt) {
  const raw = String(password || "") + String(salt || "");

  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    raw,
    Utilities.Charset.UTF_8,
  );

  return bytes
    .map(function (b) {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? "0" + v : v;
    })
    .join("");
}
