
import { RxPerson } from "react-icons/rx";
import { MdOutlineWork, MdAutoGraph } from "react-icons/md";
import { VscVerifiedFilled } from "react-icons/vsc";

export function WhyChooseUs() {
    return (
        <section className="choose-section  p-5 ">

            <h5 className="choose-label d-flex justify-content-center">
                WHY CHOOSE CAMPUSPLACE
            </h5>

            <h1 className="d-flex justify-content-center">
                Everything you need to build your successful career
            </h1>

            <div className="d-flex gap-3 mt-5">

                <div className="feature-card p-3 text-center">
                    <RxPerson
                        size={50}
                        className="company-icon d-block mx-auto rounded-circle p-2"
                    />
                    <br />
                    <h3>Top Companies</h3>
                    <p>
                        Connect with 250+ Verified Companies
                        hiring the best student talent
                    </p>
                </div>

                <div className="feature-card p-3 text-center">
                    <MdOutlineWork
                        size={50}
                        className="opportunity-icon d-block mx-auto rounded-circle p-2"
                    />
                    <br />
                    <h3>Curated Opportunities</h3>
                    <p>
                        Connect with 250+ Verified Companies
                        hiring the best student talent
                    </p>
                </div>

                <div className="feature-card p-3 text-center">
                    <MdAutoGraph
                        size={50}
                        className="matching-icon d-block mx-auto rounded-circle p-2"
                    />
                    <br />
                    <h3>Smart Matching</h3>
                    <p>
                        Connect with 250+ Verified Companies
                        hiring the best student talent
                    </p>
                </div>

                <div className="feature-card p-3 text-center">
                    <VscVerifiedFilled
                        size={50}
                        className="support-icon d-block mx-auto rounded-circle p-2"
                    />
                    <br />
                    <h3>Career Support</h3>
                    <p>
                        Connect with 250+ Verified Companies
                        hiring the best student talent
                    </p>
                </div>

            </div>
        </section>
    );
}
