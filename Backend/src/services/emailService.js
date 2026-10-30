const transporter = require("../config/emailConfig");

const {
  verificationEmailTemplate
} = require("./emailTemplates");

// General-purpose email function
const sendEmail = async ({
  to,
  subject,
  text,
  html
}) => {
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });

  return info;
};

// Email verification function
const sendVerificationEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Verify Your Email - CampusPlace",
    text: `Your CampusPlace verification OTP is ${otp}. It expires in 5 minutes.`,
    html: verificationEmailTemplate(otp)
  });
};


// ========== RECRUITER PENDING APPROVAL EMAIL ==========

const sendRecruiterPendingEmail = async (recruiter) => {
  return sendEmail({
    to: recruiter.email,
    subject: "Registration Pending Approval - CampusPlace",

    text: `Dear ${recruiter.fullName},

Your recruiter registration for ${recruiter.companyName} has been completed successfully.

Your account is currently awaiting approval from the Admin, MAIMT.

You will receive another email once your request has been reviewed.

Regards,
CampusPlace Team`
  });
};


// ========== RECRUITER APPROVED EMAIL ==========

const sendRecruiterApprovedEmail = async (recruiter) => {
  console.log('reached the email sending')
  return sendEmail({
    to: recruiter.email,
    subject: "Recruiter Account Approved - CampusPlace",

    text: `Dear ${recruiter.fullName},

Congratulations!

Your recruiter account for ${recruiter.companyName} has been approved by the Admin, MAIMT.

You can now log in to CampusPlace, post job opportunities, and manage applicants.

Regards,
CampusPlace Team`
  });
};


// ========== RECRUITER REJECTED EMAIL ==========

const sendRecruiterRejectedEmail = async (recruiter) => {
  console.log('reached the delete email sending')

  return sendEmail({
    to: recruiter.email,
    subject: "Recruiter Registration Rejected - CampusPlace",

    text: `Dear ${recruiter.fullName},

Your recruiter registration request for ${recruiter.companyName} has been reviewed.

Unfortunately, your request was not approved by the Admin, MAIMT.

For further information, please contact the administration.

Regards,
CampusPlace Team`
  });
};



const sendNewJobEmail = async (email, job) => {
  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const jobUrl = `${frontendUrl}/jobs/${job._id}`;

  // Safely escape dynamic values before inserting them into HTML
  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  const jobTitle = escapeHtml(job.jobTitle);
  const companyName = escapeHtml(job.companyName);
  const location = escapeHtml(job.location);
  const jobType = escapeHtml(job.jobType);
  const workMode = escapeHtml(job.workMode);
  const salary = escapeHtml(job.salary || "Not specified");
  const experience = escapeHtml(job.experience || "Not specified");
  const qualification = escapeHtml(
    job.qualification || "Not specified"
  );

  const deadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "Please check the job details";

  const safeDeadline = escapeHtml(deadline);

  return sendEmail({
    to: email,
    subject: `New Job: ${job.jobTitle} at ${job.companyName} | CampusPlace`,

    text: `Hello,

A new job opportunity is waiting for you on CampusPlace!

Job Title: ${job.jobTitle}
Company: ${job.companyName}
Location: ${job.location}
Job Type: ${job.jobType}
Work Mode: ${job.workMode}
Salary: ${job.salary || "Not specified"}
Experience: ${job.experience || "Not specified"}
Qualification: ${job.qualification || "Not specified"}
Application Deadline: ${deadline}

View the job and apply here:
${jobUrl}

Best wishes,
CampusPlace Team`,

    html: `
      <div style="margin:0;padding:30px 12px;background:#f3f6fc;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5eaf3;">

          <div style="padding:28px 24px;background:#273cba;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;">
              CampusPlace
            </h1>
            <p style="margin:10px 0 0;color:#e0e7ff;font-size:14px;">
              Connecting Students with Opportunities
            </p>
          </div>

          <div style="padding:28px 24px;">
            <p style="margin:0 0 10px;color:#64748b;font-size:14px;">
              NEW OPPORTUNITY
            </p>

            <h2 style="margin:0 0 12px;color:#172554;font-size:25px;line-height:1.4;">
              ${jobTitle}
            </h2>

            <p style="margin:0 0 22px;color:#475569;font-size:16px;">
              ${companyName}
            </p>

            <div style="padding:18px;background:#f8faff;border:1px solid #e5eaf3;border-radius:10px;">
              <p style="margin:0 0 14px;color:#334155;">
                <strong>Location:</strong> ${location}
              </p>
              <p style="margin:0 0 14px;color:#334155;">
                <strong>Job Type:</strong> ${jobType}
              </p>
              <p style="margin:0 0 14px;color:#334155;">
                <strong>Work Mode:</strong> ${workMode}
              </p>
              <p style="margin:0 0 14px;color:#334155;">
                <strong>Salary:</strong> ${salary}
              </p>
              <p style="margin:0 0 14px;color:#334155;">
                <strong>Experience:</strong> ${experience}
              </p>
              <p style="margin:0;color:#334155;">
                <strong>Qualification:</strong> ${qualification}
              </p>
            </div>

            <div style="margin:22px 0;padding:14px;background:#fff7ed;border-radius:8px;">
              <p style="margin:0;color:#9a3412;font-size:14px;">
                <strong>Application Deadline:</strong> ${safeDeadline}
              </p>
            </div>

            <div style="text-align:center;margin:28px 0;">
              <a href="${escapeHtml(jobUrl)}"
                 style="display:inline-block;padding:14px 26px;background:#4338ca;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">
                View Job &amp; Apply
              </a>
            </div>

            <p style="margin:0;color:#64748b;font-size:14px;line-height:1.7;">
              Don't miss this opportunity! Visit CampusPlace to explore
              the job details and submit your application before the deadline.
            </p>
          </div>

          <div style="padding:20px 24px;background:#f8fafc;border-top:1px solid #e5eaf3;text-align:center;">
            <p style="margin:0 0 8px;color:#334155;font-weight:bold;">
              CampusPlace Team
            </p>
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              This email was sent because you are a CampusPlace student
              or newsletter subscriber.
            </p>
          </div>

        </div>
      </div>
    `,
  });
};

// ========== PASSWORD RESET OTP EMAIL ==========

const sendPasswordResetOtpEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Reset Your Password - CampusPlace",

    text: `Hello,

We received a request to reset your CampusPlace password.

Your password reset OTP is: ${otp}

This OTP will expire in 5 minutes.

If you did not request a password reset, please ignore this email.

Regards,
CampusPlace Team`,

    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937;">
        <h2 style="color: #4f46e5;">CampusPlace</h2>

        <h3>Password Reset Request</h3>

        <p>We received a request to reset your password.</p>

        <p>Your verification code is:</p>

        <h1 style="
          letter-spacing: 8px;
          color: #4f46e5;
          background: #f3f4f6;
          padding: 16px;
          text-align: center;
          border-radius: 8px;
        ">
          ${otp}
        </h1>

        <p>This OTP is valid for <strong>5 minutes</strong>.</p>

        <p>If you did not request this, you can safely ignore this email.</p>

        <hr style="border: 0; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 13px; color: #6b7280;">
          Regards,<br />
          CampusPlace Team
        </p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendRecruiterPendingEmail,
  sendRecruiterApprovedEmail,
  sendRecruiterRejectedEmail,
  sendNewJobEmail,
  sendPasswordResetOtpEmail
};