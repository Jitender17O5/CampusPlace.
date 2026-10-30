
const Application = require("../models/applicationModel");
const Job = require("../models/jobModel");

// Apply for a job
exports.applyJob = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    const existing = await Application.findOne({
      student: studentId,
      job: jobId
    });

    if (existing) {
      return res.status(409).json({
        message: "You already applied for this job"
      });
    }

    await Application.create({
      student: studentId,
      job: jobId
    });

    res.status(201).json({
      message: "Job applied successfully!"
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already applied for this job"
      });
    }

    res.status(500).json({
      message: "Application failed"
    });
  }
};

// Get logged-in student's applications

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.student._id
    })
      .populate(
        "job",
        "jobTitle companyName location jobType workMode salary status deadline"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      applications: applications
    });

  } catch (error) {
    console.error("Get applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications"
    });
  }
};


exports.getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Verify recruiter authentication
    if (!req.recruiter) {
      return res.status(401).json({
        message: "Recruiter authentication required"
      });
    }

    // Find the job and verify its owner
    const job = await Job.findOne({
      _id: jobId,
      recruiter: req.recruiter._id
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or access denied"
      });
    }

    // Fetch students who applied for this job
    const applications = await Application.find({
      job: jobId
    })
      .populate(
        "student",
        "fullName collegeEmail phone course college cgpa skills resume linkedin github"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      job: {
        _id: job._id,
        jobTitle: job.jobTitle,
        companyName: job.companyName
      },
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error("Get job applicants error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid job ID"
      });
    }

    return res.status(500).json({
      message: "Failed to fetch applicants"
    });
  }
};



exports.getRecruiterApplicants = async (req, res) => {
  try {
    // Get jobs posted by the logged-in recruiter
    const jobs = await Job.find({
      recruiter: req.recruiter._id
    }).select("_id");

    // Extract job IDs
    const jobIds = jobs.map((job) => job._id);

    // Get applications for all these jobs
    const applications = await Application.find({
      job: { $in: jobIds }
    })
      .populate(
  "student",
  "fullName collegeEmail phone course college cgpa skills resumeUrl linkedin github"
)
      .populate(
        "job",
        "jobTitle companyName location jobType"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error("Get recruiter applicants error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter applicants"
    });
  }
};
