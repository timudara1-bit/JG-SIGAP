class SecurityService {

  static generateSalt() {
    return Utilities.getUuid();
  }

  static hashPassword(password, salt) {
    const plainPassword = String(password || "");
    const plainSalt = String(salt || "");
    const ITERATIONS = 1000;
    let hash = plainPassword + plainSalt;

    for (let i = 0; i < ITERATIONS; i++) {
      const rawHash = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        hash
      );

      hash = rawHash
        .map(b => (b + 256).toString(16).slice(-2))
        .join("");
    }

    return hash;
  }

  static verifyPassword(password, salt, passwordHash) {
    if (!passwordHash) return false;
    return this.hashPassword(password, salt) === passwordHash;
  }
}
