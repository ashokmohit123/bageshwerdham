import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const KanyaVivahVideoSlider = () => {
  const [mediaData, setMediaData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null); // ✅ ref for Bootstrap carousel

  // ✅ Fetch API data
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectkanyavivah_videoslider`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMediaData(res.data);
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Attach Bootstrap carousel slide event
  useEffect(() => {
    const carouselEl = carouselRef.current;
    if (!carouselEl) return;

    const handleSlideChange = (e) => {
      // Bootstrap includes 'to' property in event.detail
      const index = e.to ?? e.detail?.to;
      if (index !== undefined) setActiveIndex(index);
    };

    carouselEl.addEventListener("slid.bs.carousel", handleSlideChange);

    return () => {
      carouselEl.removeEventListener("slid.bs.carousel", handleSlideChange);
    };
  }, []);

  // ✅ Handle video play/pause
  useEffect(() => {
    if (!mediaData) return;
    const allVideos = document.querySelectorAll("video");
    allVideos.forEach((video, index) => {
      if (index === activeIndex) {
        video.play().catch(() => {}); // ignore autoplay errors
      } else {
        video.pause();
      }
    });
  }, [activeIndex, mediaData]);

  if (!mediaData) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  return (
    <section className="kanya-vivah-video-slider">
      <div className="container-fluid p-0">
        <div
          id="mediaCarousel"
          className="carousel slide"
          data-bs-ride="false" // Prevent Bootstrap autoplay
          ref={carouselRef} // ✅ ref attached here
        >
          <div className="carousel-inner rounded shadow">
            {mediaData.map((item, index) => (
              <div
                key={index}
                className={`carousel-item ${index === activeIndex ? "active" : ""}`}
              >
                {item.type === "video" ? (
                  item.videoimg ? (
                    <div className="ratio ratio-16x9">
                      <video
                        src={`${BASE_URL}/${item.videoimg}`.replace(/([^:]\/)\/+/g, "$1")}
                        title={item.title}
                        autoPlay={index === activeIndex}
                        muted
                        loop
                        controls
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <p className="text-center text-muted">Video not available</p>
                  )
                ) : (
                  <img
                    src={`${BASE_URL}/${item.videoimg}`.replace(/([^:]\/)\/+/g, "$1")}
                    className="d-block w-100"
                    alt={item.alt || `slide-${index}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
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

export default KanyaVivahVideoSlider;
