function getUserProfile(nik){

  const users =
    getSheetData("01_M_USER");

  const employees =
    getSheetData("MST_KARYAWAN");

  const user =
    users.find(r => r[1] == nik);

  const emp =
    employees.find(r => r[0] == nik);

  if(!user || !emp)
    return null;

  return {

    user_id: user[0],
    nik: emp[0],
    nama: emp[1],
    email: emp[2],

    jabatan_code: emp[3],
    jabatan_name: emp[4],

    dept_code: emp[5],
    dept_name: emp[6],

    perusahaan_code: emp[7],
    perusahaan_name: emp[8],

    role_code: user[4],
    approver_level: user[5]

  };

}