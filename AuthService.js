/**
 * =====================================================
 * AUTH SERVICE
 * JG-SIGAP
 * =====================================================
 */
class AuthService {

  /**
   * LOGIN
   */
    static login(email, password) {

    const employee =
      Repository.findOne(
        CONFIG.SHEET.KARYAWAN,
        "email",
        email
      );

    if (!employee) {

      throw new Error(
        "Email tidak terdaftar"
      );

    }

    const user =
      Repository.findOne(
        CONFIG.SHEET.USER,
        "nik",
        employee.nik
      );

    if (!user) {

      throw new Error(
        "Akun belum dibuat"
      );

    }

    if (!user.aktif) {

      throw new Error(
        "User tidak aktif"
      );

    }

    const attempt =
      Number(
        user.login_attempt || 0
      );

    if (attempt >= 5) {

      throw new Error(
        "Akun terkunci"
      );

    }

    const valid =
      SecurityService.verifyPassword(
        password,
        user.salt,
        user.password_hash
      );

    if (!valid) {

      Repository.update(
        CONFIG.SHEET.USER,
        user.user_id,
        {
          login_attempt:
            attempt + 1
        }
      );

      throw new Error(
        "Password salah"
      );

    }

    Repository.update(
      CONFIG.SHEET.USER,
      user.user_id,
      {
        login_attempt: 0,
        last_login: new Date()
      }
    );

    SessionService.create({

      ...user,

      nama:
        employee.nama,

      email:
        employee.email,

      dept_code:
        employee.dept_code,

      jabatan:
        employee.jabatan

    });

    return {

      success: true,

      user: {

        ...user,

        nama:
          employee.nama,

        email:
          employee.email,

        dept_code:
          employee.dept_code,

        jabatan:
          employee.jabatan

      }

    };

  }


  /**
   * REGISTER
   */
  static register(data) {

    const employee =
      Repository.findOne(
        CONFIG.SHEET.MST_KARYAWAN,
        "nik",
        data.nik
      );

    if (!employee) {

      throw new Error(
        "NIK tidak ditemukan pada master karyawan"
      );

    }

    const existingEmail =
      Repository.findOne(
        CONFIG.SHEET.USER,
        "email",
        employee.email
      );

    if (existingEmail) {

      throw new Error(
        "User sudah terdaftar"
      );

    }

    if (
      data.password !==
      data.confirmPassword
    ) {

      throw new Error(
        "Konfirmasi password tidak cocok"
      );

    }

    const salt =
      SecurityService.generateSalt();

    const passwordHash =
      SecurityService.hashPassword(
        data.password,
        salt
      );

    const user = {

      user_id:
        Utilities.getUuid(),

      nik:
        employee.nik,

      nama:
        employee.nama,

      email:
        employee.email,

      password_hash:
        passwordHash,

      salt:
        salt,

      last_login:
        "",

      login_attempt:
        0,

      dept_code:
        employee.dept_code,

      jabatan:
        employee.jabatan,

      role_code:
        "REQUESTER",

      approver_level:
        0,

      aktif:
        true,

      created_at:
        new Date()

    };

    Repository.insert(
      CONFIG.SHEET.USER,
      user
    );

    return {

      success: true,

      message:
        "Registrasi berhasil"

    };

  }

  /**
   * GANTI PASSWORD
   */
  static changePassword(
    email,
    oldPassword,
    newPassword
  ) {

    const user =
      Repository.findOne(
        CONFIG.SHEET.USER,
        "email",
        email
      );

    if (!user) {

      throw new Error(
        "User tidak ditemukan"
      );

    }

    const valid =
      SecurityService.verifyPassword(
        oldPassword,
        user.salt,
        user.password_hash
      );

    if (!valid) {

      throw new Error(
        "Password lama salah"
      );

    }

    const salt =
       SecurityService.generateSalt();

    const hash =
      SecurityService.hashPassword(
        newPassword,
        salt
      );

    Repository.update(
      CONFIG.SHEET.USER,
      user.user_id,
      {
        password_hash: hash,
        salt: salt
      }
    );

    return {

      success: true,

      message:
        "Password berhasil diubah"

    };

  }

  /**
   * RESET LOGIN ATTEMPT
   * Digunakan oleh ADMIN
   */
  static unlockUser(userId) {

    Repository.update(
      CONFIG.SHEET.USER,
      userId,
      {
        login_attempt: 0
      }
    );

    return {

      success: true,

      message:
        "User berhasil dibuka"

    };

  }

  /**
   * LOGOUT
   */

  static logout(){

    const session =
      SessionService.getSession();

    if(session){

      AuditService.write(
        "AUTH",
        "",
        "LOGOUT",
        session.user_id,
        "User Logout"
      );

    }

    PropertiesService
      .getUserProperties()
      .deleteAllProperties();

    return true;

  }
  

}

  /**
 * =====================================================
 * WEBAPP FUNCTIONS
 * =====================================================
 */

  function loginUser(
    email,
    password
  ) {

    return AuthService.login(
      email,
      password
    );

  }

  function logoutUser() {

    return AuthService.logout();

  }

  function registerUser(
    data
  ) {

    return AuthService.register(
      data
    );

  }


  function changePassword(
    email,
    oldPassword,
    newPassword
  ) {

    return AuthService.changePassword(
      email,
      oldPassword,
      newPassword
    );

  }

  function unlockUser(
    userId
  ) {

    return AuthService.unlockUser(
      userId
    );

  }















