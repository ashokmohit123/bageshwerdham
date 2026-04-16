import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FavoriteThingSlider = () => {
  const sliderRef = useRef(null);
  const [slidesData, setSlidesData] = useState([]); // ✅ fix: start with []

  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectfavoriteslider`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        setSlidesData(res.data || []); // ✅ safety check
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
      });
  }, []);

  return (
    <section className="new-carousel-favorite">
      <div className="wrapper2" style={{ paddingTop: "10px" }}>
        <div className="container-fluid mt-4">
          <div className="d-flex justify-content-start align-items-center mb-2">
            <div className="arrow-btn-info-top" style={{ marginBottom: "15px" }}>
              <button className="arrow-btn arrow-left" onClick={slideLeft}>
                ‹
              </button>
              <button className="arrow-btn arrow-right" onClick={slideRight}>
                ›
              </button>
            </div>
          </div>

          <div
            className="slider-container favorite-slider-container"
            style={{ overflow: "hidden", position: "relative" }}
          >
            <div
              ref={sliderRef}
              id="slider2"
              className="slider-wrapper favorite-slider"
              style={{
                display: "flex",
                // height: "584px",
                overflowX: "hidden",
                overflowY: "hidden",
                gap: "15px",
              }}
            >
              {slidesData.map((slide, index) => (
                <div className="event-card favorite-carousel" key={index}>
                  <div className="video-card  favorite-thing-thumb mx-auto">
                    {/* Thumbnail */}
                    <img src={`${BASE_URL}${slide.img_src}`} height="100px" alt="Video Thumbnail" />

                    {/* Video */}
                    <video
                      src={`${BASE_URL}${slide.video}`}
                      muted
                      loop
                      playsInline
                      autoPlay
                      style={{ width: "100%", borderRadius: "10px" }}
                    />

                    <div className="diffrent-info-desc mt-3">
                      <h4>{slide.title}</h4>
                      <p>{slide.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FavoriteThingSlider;
