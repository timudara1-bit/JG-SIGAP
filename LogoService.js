/*************************************************
 * LOGO SERVICE - SAFE HOTFIX V6.3
 * Server-side helper. Tidak wajib di-include ke Index.
 *************************************************/
function getAppLogoUrl() {
  return "https://drive.google.com/thumbnail?id=1khiHehuJxwrcC_6LE__O9yXvBV6Hx_O6";
}

function getAppLogoImg(className) {
  className = className || "app-logo-img";
  return '<img src="https://drive.google.com/thumbnail?id=1khiHehuJxwrcC_6LE__O9yXvBV6Hx_O6" class="' + className + '" alt="JG-SIGAP Logo">';
}
