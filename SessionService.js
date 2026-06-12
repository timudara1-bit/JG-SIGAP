class SessionService {

  static create(user) {

    const session = {

      user_id: user.user_id,
      nik: user.nik,
      nama: user.nama,
      email: user.email,
      role: user.role_code,
      dept: user.dept_code,

      login_at: new Date().getTime()

    };

    PropertiesService
      .getUserProperties()
      .setProperty(
        "SESSION",
        JSON.stringify(session)
      );

  }

  static getSession() {

    const data =
      PropertiesService
      .getUserProperties()
      .getProperty("SESSION");

    if (!data) return null;

    return JSON.parse(data);

  }

  static isLoggedIn() {

    return this.getSession() !== null;

  }

  

}

function getCurrentUser(){

  return SessionService.getSession();

}