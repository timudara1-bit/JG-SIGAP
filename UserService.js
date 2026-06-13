function getUserProfile(identifier) {

  const users = Repository.getAll(CONFIG.SHEET.USER);
  const employees = Repository.getAll(CONFIG.SHEET.EMPLOYEE);

  const user = users.find(u =>
    same(u.user_id, identifier) ||
    same(u.employee_id, identifier) ||
    same(u.nik, identifier) ||
    same(u.email, identifier) ||
    same(u.username, identifier)
  );

  if (!user) return null;

  const emp = employees.find(e =>
    same(e.employee_id, user.employee_id) ||
    same(e.nik, user.nik) ||
    same(e.email, user.email)
  );

  if (!emp) return null;

  return {
    user_id: user.user_id,
    employee_id: emp.employee_id,
    nik: emp.nik,
    nama: emp.full_name || emp.nama,
    full_name: emp.full_name || emp.nama,
    email: emp.email || user.email,
    jabatan_code: emp.position || user.jabatan,
    jabatan_name: emp.position || user.jabatan,
    dept_code: emp.department_id || user.department_id || user.dept_code,
    dept_name: emp.department_id || user.dept_code,
    perusahaan_code: emp.company_code || "",
    perusahaan_name: emp.company_code || "",
    role_code: user.role_code || CONFIG.ROLE.REQUESTER,
    approver_level: user.approver_level || 0
  };
}
