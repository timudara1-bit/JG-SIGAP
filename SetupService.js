// function checkSheetUser() {

//   const sheet =
//     SpreadsheetApp
//       .getActiveSpreadsheet()
//       .getSheetByName("01_M_USER");

//   Logger.log(sheet);

// }

// function testHello() {

//   Logger.log("HELLO WORLD");

// }

// function testRepositoryInsert() {

//   const data = {
//     user_id: "TEST001",
//     nik: "123456",
//     password_hash: "HASH",
//     salt: "SALT",
//     role_code: "ADMIN",
//     approver_level: 1,
//     aktif: true,
//     last_login: "",
//     login_attempt: 0,
//     create_at: new Date(),
//     update_at: "",
//     delete_at: ""
//   };

//   Logger.log(JSON.stringify(data));

//   Repository.insert(
//     "01_M_USER",
//     data
//   );

// }

// function testDirectInsert() {

//   const sheet =
//     SpreadsheetApp
//       .getActiveSpreadsheet()
//       .getSheetByName("01_M_USER");

//   Logger.log(sheet.getName());

//   sheet.appendRow([
//     "TEST001",
//     "123456",
//     "HASH",
//     "SALT",
//     "ADMIN",
//     1,
//     true,
//     "",
//     0,
//     new Date(),
//     "",
//     ""
//   ]);

// }

function seedUserAccount() {

  const users = [

    // {
    //   nik: "20031097",
    //   role_code: "GA_INVOICE"
    // },

    // {
    //   nik: "1509605",
    //   role_code: "GA_VERIFY"
    // },

    // {
    //   nik: "21111244",
    //   role_code: "GA_RECEIVE"
    // },

    // {
    //   nik: "1206190",
    //   role_code: "GA_PR"
    // },

    // {
    //   nik: "20031103",
    //   role_code: "SCM"
    // },

    // {
    //   nik: "20031105",
    //   role_code: "PAYMENT"
    // },

    {
      nik: "9414.00.0047",
      role_code: "GA-APPROVE L1"
    }

    // {
    //   nik: "8911.01.0024",
    //   role_code: "SUPERADMIN"
    // }



  ];

  const defaultPassword = "Welcome@123";

  users.forEach(user => {

    try {

      const salt =
        SecurityService.generateSalt();

      const hash =
        SecurityService.hashPassword(
          defaultPassword,
          salt
        );

      Repository.insert(
        "01_M_USER",
        {

          user_id:
            Utilities.getUuid(),

          nik:
            user.nik,

          password_hash:
            hash,

          salt:
            salt,

          role_code:
            user.role_code,

          approver_level:
            1,

          aktif:
            true,

          last_login:
            "",

          login_attempt:
            0,

          create_at:
            new Date(),

          update_at:
            "",

          delete_at:
            ""

        }
      );

      Logger.log(
        "SUCCESS : " +
        user.nik
      );

    } catch(err){

      Logger.log(
        "ERROR : " +
        user.nik
      );

      Logger.log(
        err.message
      );

    }

  });

}

// function testInsertUser(){

//   Repository.insert(
//     "01_M_USER",
//     {

//       user_id:
//         Utilities.getUuid(),

//       nik:
//         "TEST123",

//       password_hash:
//         "HASH",

//       salt:
//         "SALT",

//       role_code:
//         "ADMIN",

//       approver_level:
//         1,

//       aktif:
//         true,

//       last_login:
//         "",

//       login_attempt:
//         0,

//       create_at:
//         new Date(),

//       update_at:
//         "",

//       delete_at:
//         ""

//     }

//   );

// }