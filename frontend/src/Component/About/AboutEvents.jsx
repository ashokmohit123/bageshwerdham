import React, { useRef, useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AboutEvents = () => {
  const [aboutevents, setAboutEvents] = useState(null);

  const trackRef = useRef(null);
  const videoRefs = useRef([]); // holds video DOM nodes
  const step = 320;

  // ✅ Get events data
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectabout_events`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res.data.length > 0) {
          setAboutEvents(res.data);
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Match videoRefs length to cards
  useEffect(() => {
    if (aboutevents) {
      videoRefs.current = videoRefs.current.slice(0, aboutevents.length);
    }
  }, [aboutevents]);

  const scrollBy = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const handleMouseEnter = (index) => {
    const vid = videoRefs.current[index];
    if (!vid) return;
    if (vid.paused) {
      const p = vid.play();
      if (p?.catch) p.catch(() => {});
    }
  };

  const handleMouseLeave = (index) => {
    const vid = videoRefs.current[index];
    if (!vid) return;
    vid.pause();
    try {
      vid.currentTime = 0;
    } catch (e) {}
  };

  // ✅ Don't return early — conditionally render instead
  return (
    <section className="" style={{ backgroundColor: "rgb(233, 247, 239)" }}>
      <div className="wrapper2">
        {/* Header row */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
            <h2
              className="mb-0 fw-semibold"
              style={{ color: "black", letterSpacing: "-.02em" }}
            >
              Events
            </h2>
            <a href="/es/events" className="text-decoration-none">
              <span className="d-inline-flex align-items-center gap-2 fw-medium text-muted">
                Explore all events
                <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                  <path
                    d="M10.9724 10.0006L6.84766 5.87577L8.02616 4.69727L13.3295 10.0006L8.02616 15.3038L6.84766 14.1253L10.9724 10.0006Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </a>
          </div>

          {/* Nav buttons */}
          <div className="d-none d-md-flex gap-2">
            <button
              className="btn btn-light rounded-circle p-0"
              style={{ width: 40, height: 40 }}
              onClick={() => scrollBy(-1)}
              aria-label="Left"
              type="button"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                style={{ transform: "rotate(180deg)" }}
                aria-hidden="true"
              >
                <path
                  d="M13.1685 12.0007L8.21875 7.05093L9.63296 5.63672L15.997 12.0007L9.63296 18.3646L8.21875 16.9504L13.1685 12.0007Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              className="btn btn-light rounded-circle p-0"
              style={{ width: 40, height: 40 }}
              onClick={() => scrollBy(1)}
              aria-label="Right"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path
                  d="M13.1685 12.0007L8.21875 7.05093L9.63296 5.63672L15.997 12.0007L9.63296 18.3646L8.21875 16.9504L13.1685 12.0007Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Swimlane */}
        <div className="position-relative">
          <div
            ref={trackRef}
            className="d-flex gap-2 overflow-hidden pb-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {aboutevents ? aboutevents.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className="text-white text-decoration-none flex-shrink-0"
                style={{ maxWidth: 300, width: 300 }}
              >
                <figure
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={() => handleMouseLeave(i)}
                  className="position-relative rounded-4 overflow-hidden"
                  style={{
                    aspectRatio: "3 / 4",
                    background: c.figure_bg ?? "transparent",
                    cursor: "pointer",
                  }}
                >
                  {c.type === "video" ? (
                    <video
                      ref={(el) => (videoRefs.current[i] = el)}
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{ objectFit: "cover" }}
                      playsInline
                      loop
                      muted
                      preload="metadata"
                      src={`${BASE_URL}${c.video}`}
                    />
                  ) : (
                    <img
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{ objectFit: "cover" }}
                      alt={c.brand_alt}
                      src={`${BASE_URL}${c.image}`}
                    />
                  )}
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.8), transparent 60%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 text-center px-4 py-3">
                    <div
                      className="mx-auto d-flex align-items-end justify-content-center"
                      style={{
                        maxWidth: 160,
                        height:
                            c.type === "image"
                              ? 110
                              : c.brand_alt?.includes("Leadership")
                              ? 60
                              : 100,

                      }}
                    >
                      <img alt={c.brand_alt} className="img-fluid" src={c.brand_src} />
                    </div>
                    <h3 className="fs-6 fw-normal opacity-75 mb-0 mt-3">{c.caption}</h3>
                  </div>
                </figure>
              </a>
            )) : (
              <p className="text-center text-muted py-5">Loading...</p>
            )}
          </div>
        </div>

        {/* Dots (static) */}
        <div className="d-flex justify-content-center gap-2 mt-3">
          <span className="rounded-circle bg-dark opacity-75" style={{ width: 8, height: 8 }} />
          <span className="rounded-circle bg-dark opacity-25" style={{ width: 8, height: 8 }} />
          <span className="rounded-circle bg-dark opacity-25" style={{ width: 8, height: 8 }} />
          <span className="rounded-circle bg-dark opacity-25" style={{ width: 8, height: 8 }} />
        </div>
      </div>
    </section>
  );
};

export default AboutEvents;
