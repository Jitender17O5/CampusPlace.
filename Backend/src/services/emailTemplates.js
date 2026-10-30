const verificationEmailTemplate = (otp) => {
  return `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: auto;
      padding: 24px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
    ">
      <h2 style="color: #2563eb;">
        CampusPlace
      </h2>

      <h3>Verify Your Email Address</h3>

      <p>
        Thank you for registering with CampusPlace.
        Please use the following OTP to verify
        your email address.
      </p>

      <div style="
        background: #f1f5f9;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
      ">
        <h1 style="
          letter-spacing: 8px;
          color: #1e40af;
        ">
          ${otp}
        </h1>
      </div>

      <p>
        This OTP is valid for <b>5 minutes</b>.
      </p>

      <p>
        If you did not request this verification,
        please ignore this email.
      </p>

      <hr />

      <p style="color: #64748b; font-size: 12px;">
        CampusPlace - Campus Placement Portal
      </p>
    </div>
  `;
};

module.exports = {
  verificationEmailTemplate
};