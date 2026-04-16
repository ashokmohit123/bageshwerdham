import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Introduction = () => {
  const [intro, setIntro] = useState(null);

  useEffect(() => {
    // Fetch about introduction data from API
    axios
      .get(`${BASE_URL}/api/selectabout_introduction`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        // Assuming API returns an array, take the first item
        if (res.data.length > 0) {
          setIntro(res.data[0]);
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // Loader
  if (!intro) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  return (
    <section
      className="theme--dark  position-relative overflow-hidden"
      style={{ background: "#000", color: "#fff", marginTop:"105px" }}
    >
      <div className="container position-relative">
        <div className="row ">
          {/* Left Col: Video + Text */}
          <div className="col-lg-5 mb-4 mb-lg-0 position-relative z-2">
            {/* Video */}
            <div
              className="position-relative overflow-hidden rounded-3 mb-4"
              style={{ aspectRatio: "16/9", background: "#222" }}
            >
               <video
                autoPlay
                muted
                loop
                playsInline
                className="position-absolute w-100 h-100 object-fit-cover"
                src={`${BASE_URL}${intro.videoUrl}`}
              ></video>


              {/* Gradient overlay */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: "linear-gradient(to left top, rgb(20 20 20), transparent 70%)",
                }}
              />

              {/* Play button */}
             <button
              type="button"
              className="btn position-absolute top-50 start-50 translate-middle rounded-pill px-4 py-2"
              style={{
                background: "rgb(93 91 91 / 47%)", // semi-transparent white
                border: "2px solid rgb(111 109 109 / 44%)",
                color: "#fff",
              }}
            >
              <i className="fa fa-play me-2" aria-hidden="true"></i> Watch Video
            </button>

            </div>

            {/* Text under video */}
          
          </div>
          </div>
<div className="transform-info-two-div-about-top"></div>
          {/* Right Col: Oversized Image */}
          <div className="row">
            <div className="col-lg-5">
              <div>
              <h2 className="fw-bold display-5 mb-0 text-white position-relative z-3 ">
                {intro.title}
              </h2>
              <span className="fw-monospace fs-5 text-white d-block mb-2 pt-5">
                {intro.subtitle}
              </span>
              
            </div>
            </div>
          <div className="col-lg-7 position-relative">
            <div
              className="position-relative"
              style={{
                // marginRight: "-80px",
                // marginTop: "-40px",
                zIndex: 1,
                 background: "#232325",
                 height: "312px",
              }}
            >
              <img
                src={`${BASE_URL}${intro.imageUrl}`}
                alt="Introduction"
                className="rounded-3"
                style={{
                  maxWidth: "120%",
                  objectFit: "cover",
                  position: "relative",
                  top: "-238px",
                  height: "450px !important",
                }}
              />
            </div>
          </div>
          </div>
        </div>
      
    </section>
  );
};

export default Introduction;
