import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GuaRakshaVideoSlider = () => {
  const [mediaData, setMediaData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const videoRefs = useRef([]);

  // ✅ Fetch data once
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectgauraksha_videoslider`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMediaData(res.data);
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Handle Bootstrap carousel slide event safely
  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    const handleSlide = (event) => {
      const newIndex = event.to;
      setActiveIndex(newIndex);
    };

    carouselElement.addEventListener("slid.bs.carousel", handleSlide);
    return () => carouselElement.removeEventListener("slid.bs.carousel", handleSlide);
  }, []);

  // ✅ Play/pause logic for active video only
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === activeIndex) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn("Autoplay prevented:", err.message);
            });
          }
        } else {
          video.pause();
          video.currentTime = 0; // reset to start
        }
      }
    });
  }, [activeIndex, mediaData]);

  // ✅ Loader
  if (!mediaData || mediaData.length === 0) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }
  return (
    <section className="gauraksha-video-slider">
      <div className="container-fluid p-0">
        <div
          id="mediaCarousel"
          className="carousel slide"
          data-bs-ride="false"
          ref={carouselRef}
        >
          <div className="carousel-inner rounded shadow">
            {mediaData.map((item, index) => (
              <div style={{height: '800px' }}
                key={index}
                className={`carousel-item ${index === activeIndex ? "active" : ""}`}
              >
                {item.type === "video" ? (
                  item.videoimg ? (
                    <div className="ratio ratio-16x9">
                      <video
                        ref={(el) => (videoRefs.current[index] = el)}
                        src={`${BASE_URL}${item.videoimg}`}
                        title={item.title}
                        muted
                        loop
                        controls
                        // playsInline
                        // preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <p className="text-center text-muted">Video not available</p>
                  )
                ) : (
                  <img style={{height: '800px' }}
                    src={`${BASE_URL}${item.videoimg}`}
                    className="d-block w-100"
                    alt={item.alt || `Slide ${index + 1}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#mediaCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#mediaCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
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
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuaRakshaVideoSlider;
