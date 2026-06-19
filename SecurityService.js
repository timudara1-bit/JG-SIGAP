class SecurityService {
  static generateSalt() {
    return Utilities.getUuid();
  }

  static hashPassword(password, salt) {
    const raw = String(password || "") + String(salt || "");
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
    return bytes.map(b => {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? "0" + v : v;
    }).join("");
  }

  static verifyPassword(password, hash, salt) {
    return this.hashPassword(password, salt) === String(hash || "").trim();
  }

  static token() {
    return Utilities.getUuid() + "-" + Date.now();
  }
}
