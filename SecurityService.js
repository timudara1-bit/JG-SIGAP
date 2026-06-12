class SecurityService {

  static generateSalt() {
    return Utilities.getUuid().replace(/-/g, "");
  }

  static hashPassword(password, salt) {

    const ITERATIONS = 100000;

    let hash = password + salt;

    for (let i = 0; i < ITERATIONS; i++) {

      const digest = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        hash
      );

      hash = Utilities.base64Encode(digest);

    }

    return hash;
  }

  static verifyPassword(
    password,
    salt,
    storedHash
  ) {

    const hash =
      this.hashPassword(password, salt);

    return hash === storedHash;

  }

}