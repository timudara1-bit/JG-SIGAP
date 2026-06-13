function seedAccessV2() {
  seedRolesV2();
  seedAdminUserFromEmployeeV2();
  seedAdminRoleV2();

  Logger.log("SEED ACCESS V2 SELESAI");
  Logger.log("Login: timudara1@gmail.com");
  Logger.log("Password: admin123");
}

function seedRolesV2() {
  const sh = Repository.getSheet("02_M_ROLE");

  const roles = [
    ["ADMIN", "Administrator", "Full Access", true],
    ["REQUESTER", "Requester", "User Pengajuan", true],
    ["GA", "GA Verify", "Verifikasi GA", true],
    ["FAT", "FAT Verify", "Verifikasi FAT", true],
    ["IA", "Internal Audit", "Verifikasi IA", true],
    ["PROCUREMENT", "Procurement", "PR PO", true],
    ["FINANCE", "Finance", "Invoice Payment", true],
    ["WAREHOUSE", "Warehouse", "Receive Barang", true]
  ];

  roles.forEach(r => {
    if (!isExistV2_("02_M_ROLE", "role_id", r[0])) {
      sh.appendRow(r);
    }
  });
}

function seedAdminUserFromEmployeeV2() {
  const employee =
    getEmployeeByEmailV2_("timudara1@gmail.com");

  if (!employee) {
    throw new Error("Employee tidak ditemukan di 04_M_EMPLOYEE");
  }

  const sh = Repository.getSheet("01_M_USER");

  const userId = "USR001";
  const username = "timudara1@gmail.com";
  const password = "admin123";

  const hash = SecurityService.hashPassword(password);

  if (!isExistV2_("01_M_USER", "user_id", userId)) {
    sh.appendRow([
      userId,
      employee.employee_id,
      username,
      hash,
      true,
      new Date(),
      ""
    ]);
  }
}

function seedAdminRoleV2() {
  const sh = Repository.getSheet("05_M_USER_ROLE");

  if (!isExistV2_("05_M_USER_ROLE", "user_role_id", "UR001")) {
    sh.appendRow([
      "UR001",
      "USR001",
      "ADMIN"
    ]);
  }
}

function getEmployeeByEmailV2_(email) {
  const data = sheetData("04_M_EMPLOYEE");

  return data.find(r =>
    String(r.email).trim().toLowerCase() ===
    String(email).trim().toLowerCase()
  );
}

function isExistV2_(sheetName, keyName, keyValue) {
  const data = sheetData(sheetName);

  return data.some(r =>
    String(r[keyName]).trim() === String(keyValue).trim()
  );
}

function resetAdminPasswordV2() {
  const sheet = Repository.getSheet("01_M_USER");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const userIdCol = headers.indexOf("user_id");
  const hashCol = headers.indexOf("password_hash");
  const saltCol = headers.indexOf("salt");

  if (userIdCol === -1) throw new Error("Kolom user_id tidak ditemukan");
  if (hashCol === -1) throw new Error("Kolom password_hash tidak ditemukan");
  if (saltCol === -1) throw new Error("Kolom salt tidak ditemukan di 01_M_USER");

  const userId = "USR001";
  const newPassword = "admin123";

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][userIdCol]).trim() === userId) {

      const salt = SecurityService.generateSalt();
      const hash = SecurityService.hashPassword(newPassword, salt);

      sheet.getRange(i + 1, hashCol + 1).setValue(hash);
      sheet.getRange(i + 1, saltCol + 1).setValue(salt);

      Logger.log("Password berhasil di-reset");
      Logger.log("Username: timudara1@gmail.com");
      Logger.log("Password: admin123");

      return;
    }
  }

  throw new Error("User USR001 tidak ditemukan");
}