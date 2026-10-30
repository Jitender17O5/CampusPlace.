import { useNavigate, useLocation } from "react-router-dom";
import { LuMapPin, LuClock3 } from "react-icons/lu";
import { FiHeart, FiArrowRight } from "react-icons/fi";

export const JobCard = ({ job, onApply }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewDetails = () => {
    const isStudentDashboard =
      location.pathname.startsWith("/studentDashboard");

    const path = isStudentDashboard
      ? `/studentDashboard/jobs/${job._id}`
      : `/jobs/${job._id}`;

    navigate(path);
  };

  const title = job.jobTitle || "Untitled Job";
  const company = job.companyName || "Company";
  const jobType = job.jobType || "";
  const skills = Array.isArray(job.skills) ? job.skills : [];

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "Recently";

  return (
    <div className="job-card">

      {/* COMPANY LOGO */}
      <div className="job-logo">
        {job.logo ? (
          <img
            src={job.logo}
            alt={company}
            className="job-logo-image"
          />
        ) : (
          <span
            style={{
              width: "50px",
              height: "50px",
              background: "#eef2ff",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#4f46e5",
              fontWeight: "bold",
              fontSize: "22px",
            }}
          >
            {company.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* JOB CONTENT */}
      <div className="job-content">

        <div className="job-heading">
          <div>
            <h5>{title}</h5>
            <p className="company-name">{company}</p>
          </div>

          <div className="job-card-actions">
            <FiHeart className="heart-icon" />

            <span
              className={`job-type ${jobType.toLowerCase() === "internship"
                  ? "internship"
                  : "full-time"
                }`}
            >
              {jobType}
            </span>
          </div>
        </div>

        {/* LOCATION AND DATE */}
        <div className="job-info">
          <span>
            <LuMapPin />
            {job.location || "Not specified"}
          </span>

          <span>
            <LuClock3 />
            {postedDate}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="job-description">
          {job.description || "No description available."}
        </p>

        {/* SKILLS */}
        <div className="job-skills">
          {skills.slice(0, 4).map((skill, index) => (
            <span key={index}>{skill}</span>
          ))}
        </div>

        {/* SALARY AND DETAILS */}

        {/* SALARY AND ACTION BUTTONS */}
        <div className="job-bottom">

          <div className="job-compensation">
            <span className="job-compensation-label">
              {job.jobType === "Internship"
                ? "Stipend"
                : "Salary / Package"}
            </span>

            <strong>
              {job.salary?.trim() || "Not disclosed"}
            </strong>
          </div>

          <div className="job-action-buttons">
            <button
              type="button"
              className="view-job-btn"
              onClick={handleViewDetails}
            >
              View Details
              <FiArrowRight />
            </button>

            {onApply && (
              <button
                type="button"
                className="apply-job-btn"
                onClick={onApply}
              >
                Apply Now
              </button>
            )}
          </div>

        </div>



      </div>
    </div>
  );
};
