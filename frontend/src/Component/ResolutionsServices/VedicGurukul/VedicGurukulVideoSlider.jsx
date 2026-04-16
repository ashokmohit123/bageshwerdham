import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VedicGurukulVideoSlider = () => {
  const [mediaData, setMediaData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  // ✅ Fetch data
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvedicgurukul_videoslider`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMediaData(res.data);
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Attach Bootstrap slide event
  useEffect(() => {
    const carouselEl = carouselRef.current;
    if (!carouselEl) return;

    const handleSlide = (event) => {
      setActiveIndex(event.to); // Bootstrap sends the next index in `event.to`
    };

    carouselEl.addEventListener("slid.bs.carousel", handleSlide);

    return () => {
      carouselEl.removeEventListener("slid.bs.carousel", handleSlide);
    };
  }, []);

  // ✅ Play/pause logic
  useEffect(() => {
    const allVideos = document.querySelectorAll("video");
    allVideos.forEach((video, index) => {
      if (index === activeIndex) {
        video.play().catch(() => {}); // Play active slide safely
      } else {
        video.pause();
      }
    });
  }, [activeIndex, mediaData]);

  if (!mediaData.length) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  return (
    <section className="kanya-vivah-video-slider">
      <div className="container-fluid p-0">
        <div
          id="mediaCarousel"
          className="carousel slide"
          data-bs-ride="false"
          ref={carouselRef}
        >
          <div className="carousel-inner rounded shadow">
            {mediaData.map((item, index) => {
              const videoSrc = item.videoimg
                ? `${BASE_URL}/${item.videoimg}`.replace(/([^:]\/)\/+/g, "$1")
                : null;

              return (
                <div
                  key={index}
                  className={`carousel-item ${
                    index === activeIndex ? "active" : ""
                  }`}
                >
                  {item.type === "video" && videoSrc ? (
                    <div className="ratio ratio-16x9">
                      <video
                        src={videoSrc}
                        title={item.title}
                        autoPlay={index === activeIndex}
                        muted
                        loop
                        controls
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : item.type === "image" && videoSrc ? (
                    <img
                      src={videoSrc}
                      className="d-block w-100"
                      alt={item.alt || `slide-${index}`}
                    />
                  ) : (
                    <p className="text-center text-muted py-5">
                      Media not available
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#mediaCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#mediaCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>

          {/* Indicators */}
          <div className="carousel-indicators">
            {mediaData.map((_, index) => (
              <button
                key={index}
                type="button"
                data-bs-target="#mediaCarousel"
                data-bs-slide-to={index}
                className={index === activeIndex ? "active" : ""}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VedicGurukulVideoSlider;
