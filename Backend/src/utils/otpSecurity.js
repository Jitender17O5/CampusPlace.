const crypto = require("crypto");

const hashOtp = (otp, email, role) => {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET is not configured");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${role}:${email}:${otp}`)
    .digest("hex");
};

const verifyOtpHash = (otp, email, role, storedHash) => {
  if (
    typeof storedHash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(storedHash)
  ) {
    return false;
  }

  const enteredHash = hashOtp(otp, email, role);

  return crypto.timingSafeEqual(
    Buffer.from(enteredHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
};

module.exports = {
  hashOtp,
  verifyOtpHash
};