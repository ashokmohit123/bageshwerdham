import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const GurudevResolution = () => {
  const [resolutionData, setResolutionData] = useState([]); // ✅ null से [] कर दिया

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectgurudevresolutions`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        setResolutionData(res.data || []); // ✅ अगर data खाली है तो [] assign कर दो
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
      });
  }, []);

  console.log("Fetched events:", resolutionData);

  return (
    <section
      className="theme--dark pb-5 pt-5 position-relative overflow-hidden"
      style={{ backgroundColor: "#111" }}
    >
      <div>
        {resolutionData.length > 0 ? (
          resolutionData.map((resolData, index) => (
            <div className="container" key={index}>
              {/* Row 1 */}
              <div className="row align-items-stretch flex-column flex-md-row">
                {/* Left Image */}
                <div className="col-md-4 mb-4 mb-md-0 d-flex align-items-end">
                  <div
                    className="position-relative w-100 rounded-4 overflow-hidden"
                    style={{
                      aspectRatio: "16 / 9",
                      background: "rgba(32, 75, 204, 1)",
                      padding: "20px",
                    }}
                  >
                    <img
                      src={`${BASE_URL}${resolData.image}`}
                      alt={resolData.title}
                      className="img-fluid position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                    />

                    <div
                      className="position-absolute top-0 start-0 d-none d-md-block"
                      style={{
                        background:
                          "linear-gradient(to right bottom, transparent 70%, rgba(11, 104, 226, 1) 90%)",
                        width: "100%",
                        height: "100%",
                      }}
                    ></div>
                    <div
                      className="position-absolute top-0 start-0 d-block d-md-none"
                      style={{
                        background: `linear-gradient(transparent 50%, rgba(30, 92, 226, 1) 90%)`,
                        width: "100%",
                        height: "100%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Right Heading */}
                <div className="col-md-8 d-flex align-items-center">
                  <h2 className="text-white fw-semibold display-6">
                    {resolData.title}
                  </h2>
                </div>
              </div>

              {/* Divider */}
              <div
                className="d-md-none row"
                style={{ background: "rgba(23, 30, 165, 1)", height: "20px" }}
              >
                <div className="col-5 rounded-end bg-primary"></div>
                <div className="col-2"></div>
                <div className="col-5 rounded-start bg-primary"></div>
              </div>

              {/* Row 2 */}
              <div className="row flex-column flex-md-row">
                {/* Stats + Buttons */}
                <div className="col-md-4 order-2 order-md-1">
                  <div className="mb-4">
                    <div className="row row-cols-2 g-3 mb-4 text-white">
                      <div>
                        <p className="h4 fw-bold mb-1">{resolData.stats}%</p>
                      </div>
                    </div>
                    <p className="text-white">{resolData.description}</p>
                  </div>

                  <a
                    href={resolData.buttons}
                    className="btn btn-warning result-program text-white w-100 mb-3"
                  >
                   Bageshwar Dham
                  </a>
                </div>

                {/* Video */}
                <div className="col-md-8 order-1 order-md-2 position-relative">
                  <div className="transform-info-two-div"></div>
                  <div
                    className="rounded-4 overflow-hidden position-relative"
                    style={{ aspectRatio: "16 / 9" }}
                  >
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="position-absolute w-100 h-100 object-fit-cover"
                      src={`${BASE_URL}${resolData.video}`}
                    ></video>
                    <div
                      className="position-absolute top-0 start-0 d-none d-md-block"
                      style={{
                        background: `linear-gradient(to left top, transparent 70%, rgba(10, 98, 212, 1) 90%)`,
                        width: "100%",
                        height: "100%",
                      }}
                    ></div>
                    <button
                      className="btn btn-outline-light position-relative z-2"
                      style={{
                        backdropFilter: "blur(4px)",
                        background: "rgba(255,255,255,0.1)",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <i className="fa fa-play me-2"></i> Watch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white text-center">Loading...</p>
        )}
      </div>
    </section>
  );
};

export default GurudevResolution;
