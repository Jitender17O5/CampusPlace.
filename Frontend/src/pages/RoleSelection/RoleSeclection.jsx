import { Container, Button } from "react-bootstrap"
import { Link, useLocation } from "react-router-dom";
// import Student from "../assets/Student.webp"
import Student from "../../assets/Student.webp"
// import Recruiter from "../assets/Recruiter.png"
import Recruiter from "../../assets/Recruiter.png"
// import admin from "../assets/Admin.png"
import { IoArrowForwardSharp } from "react-icons/io5";
import { MdOutlinePerson3 } from "react-icons/md";
import { useNavigate } from "react-router-dom";
export const RoleSelection = () => {

    const { state } = useLocation()
    const action = state?.action;
    return (
        <Container className="mt-5 mb-5">
            <h3 className="d-flex justify-content-center">Welcome Back</h3>

            <h6 className="d-flex justify-content-center ">Choose your account type to continue.</h6>
            <div className="d-flex gap-3 justify-content-center mt-4">

                {/* Student */}
                <div
                    className="p-3 rounded-3 "
                    style={{ width: "350px", border: "1px solid purple" }}
                >
                    <div className="d-flex justify-content-center">
                        <img src={Student} alt="Student" height={180} width={340} />
                    </div>

                    <div className="text-center">
                        <h1>Student</h1>
                        <p>
                            Find opportunities, apply for jobs and kickstart your career.
                        </p>
                        <Button as={Link} to={action === "login" ? "/login" : "/studentSignup"} style={{ width: "100%" }} state={{ role: "Student" }}
                        >Continue
                            <IoArrowForwardSharp style={{ marginLeft: "5px" }} />
                        </Button>
                    </div>
                </div>


                {/* Recruiter */}

                <div
                    className="p-3 rounded-3 "
                    style={{ width: "350px", border: "1px solid green" }}
                >
                    <div className="d-flex justify-content-center ">
                        <img src={Recruiter} alt="Recruiter" height={180} width={340} />
                    </div>

                    <div className="text-center">
                        <h1>Recruiter</h1>
                        <p>
                            Post jobs, discover talented students and build your team.
                        </p>
                        <Button
                            as={Link}
                            to={action === "login" ? "/login" : "/recruiterSignup"}
                            style={{ width: "100%" }}
                            state={{ role: "Recruiter" }}
                        >Continue
                            <IoArrowForwardSharp style={{ marginLeft: "5px" }} />

                        </Button>
                    </div>
                </div>


                {/* Admin */}
                {action === "login" ? <div
                    className="p-3 rounded-3"
                    style={{ width: "350px", border: "1px solid black" }}
                >
                    <div className="d-flex justify-content-center">
                        <MdOutlinePerson3 size={180} />
                    </div>

                    <div className="text-center">
                        <h1>Admin</h1>
                        <p>
                            Manage placements, companies and platform activities.
                        </p>
                        <Button
                            as={Link}
                            to="/admin/login"
                            style={{ width: "100%" }}
                        >
                            Login
                            <IoArrowForwardSharp style={{ marginLeft: "5px" }} />
                        </Button>
                    </div>
                </div> : ""}

            </div>

        </Container>

    )
}