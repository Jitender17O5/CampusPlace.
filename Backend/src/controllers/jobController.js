
const Job = require("../models/jobModel");
const NewsletterSubscriber = require("../models/newsletterModel");
const { sendNewJobEmail } = require("../services/emailService");
const Student = require("../models/studentsPostData.Model");
// ================= CREATE JOB =================

const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      location,
      jobType,
      workMode,
      salary,
      experience,
      qualification,
      skills,
      deadline,
      description,
      requirements,
    } = req.body;

    if (
      !jobTitle?.trim() ||
      !location?.trim() ||
      !jobType ||
      !workMode ||
      !deadline ||
      !description?.trim()
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
        .filter((skill) => typeof skill === "string")
        .map((skill) => skill.trim())
        .filter(Boolean)
      : typeof skills === "string"
        ? skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
        : [];

    const applicationDeadline = new Date(deadline);

    if (
      Number.isNaN(applicationDeadline.getTime()) ||
      applicationDeadline < new Date(new Date().toDateString())
    ) {
      return res.status(400).json({
        message: "Please provide a valid future deadline",
      });
    }

    const recruiter = req.recruiter;

    if (!recruiter) {
      return res.status(401).json({
        message: "Recruiter authentication required",
      });
    }

    const newJob = await Job.create({
      recruiter: recruiter._id,
      jobTitle: jobTitle.trim(),
      companyName: recruiter.companyName,
      location: location.trim(),
      jobType,
      workMode,
      salary: salary || "",
      experience: experience || "",
      qualification: qualification || "",
      skills: skillsArray,
      deadline: applicationDeadline,
      description: description.trim(),
      requirements: requirements || "",
    });

    
    // ================= NEWSLETTER NOTIFICATION =================

    
    // ================= JOB EMAIL NOTIFICATIONS =================

    try {
      // 1. Fetch newsletter subscribers
      const subscribers = await NewsletterSubscriber.find()
        .select("email")
        .lean();

      // 2. Fetch all active registered students
      const students = await Student.find({
        isDeleted: { $ne: true },
        collegeEmail: { $exists: true, $ne: "" },
      })
        .select("collegeEmail")
        .lean();

      // 3. Combine emails and remove duplicates
      const emailSet = new Set();

      subscribers.forEach((subscriber) => {
        if (subscriber.email) {
          emailSet.add(subscriber.email.trim().toLowerCase());
        }
      });

      students.forEach((student) => {
        if (student.collegeEmail) {
          emailSet.add(student.collegeEmail.trim().toLowerCase());
        }
      });

      const recipients = [...emailSet];

      console.log(
        `Sending job alerts to ${recipients.length} unique recipients`
      );

      // 4. Send job notifications
      const results = await Promise.allSettled(
        recipients.map((email) => sendNewJobEmail(email, newJob))
      );

      // 5. Report success and failure counts
      const successfulEmails = results.filter(
        (result) => result.status === "fulfilled"
      ).length;

      const failedEmails = results.length - successfulEmails;

      console.log(
        `Job notifications: ${successfulEmails} successful, ${failedEmails} failed`
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Job notification failed for ${recipients[index]}:`,
            result.reason
          );
        }
      });
    } catch (emailError) {
      console.error("Job notification error:", emailError);
    }


    // ================= END NEWSLETTER NOTIFICATION =================


    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: newJob,
    });

  } catch (error) {
    console.error("Create job error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ================= GET ALL ACTIVE JOBS =================

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      status: "active",
      deadline: { $gte: new Date() }
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs"
    });
  }
};

// ================= GET JOB BY ID =================

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    console.error("Get job error:", error);

    return res.status(500).json({
      message: "Failed to fetch job details",
    });
  }
};

// ================= GET RECRUITER JOBS =================

const getRecruiterJobs = async (req, res) => {
  try {
    const recruiter = req.recruiter;

    if (!recruiter) {
      return res.status(401).json({
        message: "Recruiter authentication required"
      });
    }

    const jobs = await Job.find({
      recruiter: recruiter._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    console.error("Get recruiter jobs error:", error);

    return res.status(500).json({
      message: "Failed to fetch recruiter jobs"
    });
  }
};

// ================= UPDATE JOB =================

const updateJob = async (req, res) => {
  try {
    if (!req.recruiter) {
      return res.status(401).json({
        message: "Recruiter authentication required"
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      recruiter: req.recruiter._id
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or access denied"
      });
    }

    const allowedFields = [
      "jobTitle",
      "location",
      "jobType",
      "workMode",
      "salary",
      "experience",
      "qualification",
      "deadline",
      "description",
      "requirements",
      "status"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    // Convert skills into an array
    if (req.body.skills !== undefined) {
      job.skills = Array.isArray(req.body.skills)
        ? req.body.skills
          .filter((skill) => typeof skill === "string")
          .map((skill) => skill.trim())
          .filter(Boolean)
        : typeof req.body.skills === "string"
          ? req.body.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
          : [];
    }

    // Validate deadline when updated
    if (req.body.deadline !== undefined) {
      const newDeadline = new Date(req.body.deadline);

      if (Number.isNaN(newDeadline.getTime())) {
        return res.status(400).json({
          message: "Invalid application deadline"
        });
      }

      job.deadline = newDeadline;
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job
    });

  } catch (error) {
    console.error("Update job error:", error);

    if (
      error.name === "CastError" ||
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Failed to update job"
    });
  }
};

// ================= DELETE JOB =================

const deleteJob = async (req, res) => {
  try {
    if (!req.recruiter) {
      return res.status(401).json({
        message: "Recruiter authentication required"
      });
    }

    const deletedJob = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.recruiter._id
    });

    if (!deletedJob) {
      return res.status(404).json({
        message: "Job not found or access denied"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });

  } catch (error) {
    console.error("Delete job error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid job ID"
      });
    }

    return res.status(500).json({
      message: "Failed to delete job"
    });
  }
};

// ================= EXPORT CONTROLLERS =================

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getRecruiterJobs,
  updateJob,
  deleteJob
};
