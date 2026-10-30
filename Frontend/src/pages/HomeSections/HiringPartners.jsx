
import { Carousel } from "react-bootstrap";

import tcs from "../../assets/tcs_logo.png";
import infosys from "../../assets/infosys.webp";
import wipro from "../../assets/wipro.webp";
import virtualize from "../../assets/virtualize.svg";
import hcl from "../../assets/hcl.png";
import amazon from "../../assets/amazon.webp";
import accenture from "../../assets/accenture.webp";

export function HiringPartners() {

    const companies = [
        tcs,
        infosys,
        wipro,
        virtualize,
        hcl,
        amazon,
        accenture
    ];

    return (
        <section className="partner-section  position-relative p-3">

            <div
                className="partner-label d-flex justify-content-center mx-auto rounded-3 pt-2"
                style={{ width: "17rem" }}
            >
                <h6>TRUSTED BY LEADING COMPANIES</h6>
            </div>

            <h1 className="d-flex justify-content-center">
                Our Hiring Partners
            </h1>

            <small
                style={{ fontSize: "20px" }}
                className="d-flex justify-content-center"
            >
                Top Companies trust CampusPlace to find and hire the best talent.
            </small>

            <Carousel
                interval={null}
                indicators={false}
                data-bs-theme="dark"
            >
                {companies.map((company, index) => (
                    <Carousel.Item key={index}>
                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ height: "130px" }}
                        >
                            <img
                                src={company}
                                alt={`Company ${index + 1}`}
                                height={80}
                                width={120}
                                style={{ objectFit: "contain" }}
                            />
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>

        </section>
    );
}
