import { Container, Row, Col, Button } from "react-bootstrap";
import { BiBuildings } from "react-icons/bi";
import { PiStudentFill } from "react-icons/pi";
import { GoShieldCheck } from "react-icons/go";
import { LuMapPin } from "react-icons/lu";
import { MdOutlineWork } from "react-icons/md";
import { CiSearch } from "react-icons/ci";

import imag from "../../assets/jobDivImage.png";
import jobBg from "../../assets/jobbgimage.png";

import { JobCard } from "./jobCard";
// import { jobData } from "./jobData";
import { getAllJobs } from "../../Api/postApi";

import { useState, useMemo, useEffect } from "react";

import "./job.css";

export const Jobs = () => {

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch jobs from MongoDB
  useEffect(() => {
    let active = true;

    const fetchJobs = async () => {
      try {
        const response = await getAllJobs();

        if (active) {
          setJobs(response.data.jobs || []);
          setError("");
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);

        if (active) {
          setError("Failed to load jobs from the server.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      active = false;
    };
  }, []);

  // Filter jobs immediately as user types or selects filters
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = search.trim().toLowerCase();

      const searchableContent = [
        job.jobTitle,
        job.companyName,
        ...(Array.isArray(job.skills)
          ? job.skills
          : [job.skills]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText || searchableContent.includes(searchText);

      const matchesLocation =
        !location ||
        (job.location || "")
          .toLowerCase()
          .includes(location.toLowerCase());

      const matchesType =
        !jobType ||
        (jobType === "remote"
          ? job.workMode === "Remote"
          : (job.jobType || "").toLowerCase() ===
          jobType.toLowerCase());

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [jobs, search, location, jobType]);

  // Reset filters
  const handleReset = () => {
    setSearch("");
    setLocation("");
    setJobType("");
  };

  // Scroll to jobs when button is clicked
  const handleSearch = () => {
    document
      .getElementById("latest-jobs")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Container fluid className="p-0">

      {/* ================= HERO ================= */}
      <div
        className="jobs-hero"
        style={{ "--jobs-bg": `url(${jobBg})` }}
      >
        <Row className="align-items-center m-0 jobs-hero-row">

          {/* LEFT SIDE */}
          <Col lg={6} md={6}>
            <div className="jobs-hero-content">

              <h1 className="jobs-hero-title">
                Find the Right Job. <br />
                <span>Build </span>Your Future
              </h1>

              <p className="jobs-hero-description">
                Discover internships and job opportunities from leading
                companies that match your skills, interests, and career
                goals — all in one place.
              </p>

              {/* BUTTONS */}
              <div className="jobs-hero-buttons">
                <Button className="jobs-explore-btn">
                  Explore Jobs
                </Button>

                <Button
                  variant="outline-primary"
                  className="jobs-companies-btn"
                >
                  View Companies
                </Button>
              </div>

              {/* STATS */}
              <div className="jobs-stats">

                <div className="jobs-stat-item">
                  <div className="jobs-stat-icon companies-stat">
                    <BiBuildings size={30} />
                  </div>

                  <div>
                    <h3>500+</h3>
                    <p>Companies</p>
                  </div>
                </div>

                <div className="jobs-stat-divider"></div>

                <div className="jobs-stat-item">
                  <div className="jobs-stat-icon students-stat">
                    <PiStudentFill size={30} />
                  </div>

                  <div>
                    <h3>10K+</h3>
                    <p>Students</p>
                  </div>
                </div>

                <div className="jobs-stat-divider"></div>

                <div className="jobs-stat-item">
                  <div className="jobs-stat-icon jobs-stat">
                    <GoShieldCheck size={30} />
                  </div>

                  <div>
                    <h3>2K+</h3>
                    <p>Job Opportunities</p>
                  </div>
                </div>

              </div>
            </div>
          </Col>

          {/* RIGHT SIDE */}
          <Col
            lg={6}
            md={6}
            className="d-flex justify-content-center align-items-end"
          >
            <div className="jobs-image-container">
              <img
                src={imag}
                alt="Student exploring job opportunities"
                className="jobs-hero-image"
              />
            </div>
          </Col>
        </Row>

        {/* ================= FLOATING SEARCH BAR ================= */}


        {/* ================= FLOATING SEARCH BAR ================= */}
        <div className="jobs-search-box">
          <div className="jobs-search-content">

            {/* SEARCH INPUT */}
            <div className="jobs-search-input">
              <CiSearch size={28} />

              <input
                type="text"
                placeholder="Search by job title, skills or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            {/* LOCATION */}
            <div className="jobs-filter">
              <LuMapPin size={25} />

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="india">India</option>
                <option value="delhi">Delhi</option>
                <option value="chandigarh">Chandigarh</option>
                <option value="Gurugram">Gurugram</option>
                <option value="bangalore">Bangalore</option>
              </select>
            </div>

            {/* JOB TYPE */}
            <div className="jobs-filter">
              <MdOutlineWork size={25} />

              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            {/* SEARCH BUTTON */}
            <Button
              className="jobs-search-btn"
              onClick={handleSearch}
            >
              <CiSearch size={24} />
              Search Jobs
            </Button>

          </div>
        </div>


      </div>
      {/* joblisting */}

      <section
        id="latest-jobs"
        className="latest-jobs-section"
      >
        <div className="latest-jobs-heading">
          <div>
            <h2>Latest Job Opportunities</h2>

            <p>
              Explore opportunities from top companies and find the
              right role for your career.
            </p>

            {!loading && !error && (
              <p>
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
            )}
          </div>

          <button
            className="view-all-jobs"
            onClick={handleReset}
          >
            View All Jobs →
          </button>
        </div>

        <Row className="g-4">
          {loading ? (
            <Col xs={12}>
              <div className="text-center py-5">
                <p>Loading jobs...</p>
              </div>
            </Col>
          ) : error ? (
            <Col xs={12}>
              <div className="text-center py-5">
                <p className="text-danger">{error}</p>
              </div>
            </Col>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Col lg={4} md={6} key={job._id}>
                <JobCard job={job} />
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center py-5">
                <h4>No Jobs Found</h4>

                <p className="text-muted">
                  Try changing your search or filters.
                </p>

                <Button onClick={handleReset}>
                  Clear Filters
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </section>

    </Container>
  );
};