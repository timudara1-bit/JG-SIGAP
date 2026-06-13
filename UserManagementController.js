/**
 * UserManagementController
 * Exposes user management functions as Apps Script global functions
 */

// ============ GET USERS ============

function getAllUsersController() {
  try {
    const users = UserManagementService.getAllUsers();
    return {
      success: true,
      data: users
    };
  } catch (error) {
    Logger.log("getAllUsersController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function getUserByIdController(userId) {
  try {
    const user = UserManagementService.getUserById(userId);
    return {
      success: true,
      data: user
    };
  } catch (error) {
    Logger.log("getUserByIdController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function searchUsersController(searchTerm) {
  try {
    const results = UserManagementService.searchUsers(searchTerm);
    return {
      success: true,
      data: results,
      count: results.length
    };
  } catch (error) {
    Logger.log("searchUsersController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ CREATE/UPDATE/DELETE USER ============

function createUserController(userData) {
  try {
    const newUser = UserManagementService.createUser(userData);
    return {
      success: true,
      message: "User berhasil ditambahkan",
      data: newUser
    };
  } catch (error) {
    Logger.log("createUserController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function updateUserController(userId, userData) {
  try {
    const updated = UserManagementService.updateUser(userId, userData);
    return {
      success: true,
      message: "User berhasil diperbarui",
      data: updated
    };
  } catch (error) {
    Logger.log("updateUserController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function deleteUserController(userId) {
  try {
    UserManagementService.deleteUser(userId);
    return {
      success: true,
      message: "User berhasil dihapus"
    };
  } catch (error) {
    Logger.log("deleteUserController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ ROLE MANAGEMENT ============

function updateUserRoleController(userId, roleCode, approverLevel) {
  try {
    const updated = UserManagementService.updateUserRole(userId, roleCode, approverLevel);
    return {
      success: true,
      message: "Role user berhasil diperbarui",
      data: updated
    };
  } catch (error) {
    Logger.log("updateUserRoleController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function getAvailableRolesController() {
  try {
    const roles = UserManagementService.getAvailableRoles();
    return {
      success: true,
      data: roles
    };
  } catch (error) {
    Logger.log("getAvailableRolesController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ PASSWORD MANAGEMENT ============

function resetPasswordController(userId) {
  try {
    const result = UserManagementService.resetPassword(userId);
    return {
      success: true,
      message: result.message,
      password: "password123" // Show default password to admin
    };
  } catch (error) {
    Logger.log("resetPasswordController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ USER ACTIVITY ============

function getUserActivityLogController(userId, limit) {
  try {
    const logs = UserManagementService.getUserActivityLog(userId, limit || 10);
    return {
      success: true,
      data: logs,
      count: logs.length
    };
  } catch (error) {
    Logger.log("getUserActivityLogController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ USER STATUS ============

function toggleUserStatusController(userId, isActive) {
  try {
    const updated = UserManagementService.toggleUserStatus(userId, isActive);
    return {
      success: true,
      message: isActive ? "User berhasil diaktifkan" : "User berhasil dinonaktifkan",
      data: updated
    };
  } catch (error) {
    Logger.log("toggleUserStatusController error: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
