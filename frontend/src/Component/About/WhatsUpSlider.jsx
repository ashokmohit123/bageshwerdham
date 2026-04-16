import React, { useEffect, useState, useRef } from "react";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const WhatsUpSlider = () => {
  const [whatsupslider, setWhatsupslider] = useState([]); // State for holding fetched program data
  const trackRef = useRef(null);
  const step = 780; // roughly min-width card (750px) + gap (≈30px)

  useEffect(() => {
    // Fetch data from API on component mount
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/selectabout_whatsupslider`, {
          headers: { apikey: "12345" },
        });
        const data = await response.json();

        // Log the fetched data for debugging
        //console.log('Fetched data:', data);

        // Ensure the 'bullets' field is always parsed into an array
        const formattedData = data.map((item) => ({
          ...item,
          bullets: item.bullets ? JSON.parse(item.bullets) : [], // Parse the bullets string into an array
        }));

        setWhatsupslider(formattedData); // Update state with the fetched and formatted data
      } catch (error) {
        console.error("Error fetching program data:", error);
      }
    };

    fetchPrograms(); // Call the function to fetch data
  }, []); // Empty dependency array means this runs once when the component mounts

  const scrollBy = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="py-0" style={{ backgroundColor: "rgb(233, 247, 239)" }}>
      <div className="wrapper2 py-4">
        {/* Header with Navigation Arrows */}
        <div
          className="d-grid align-items-end"
          style={{ gridTemplateColumns: "1fr auto", gap: "1rem" }}
        >
          <div />
          <div className="d-flex gap-2">
            <button
              className="btn btn-light rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-sm"
              type="button"
              aria-label="Left"
              style={{ width: 40, height: 40 }}
              onClick={() => scrollBy(-1)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M13.17 12L8.22 7.05l1.41-1.41L16 12l-6.37 6.36-1.41-1.41z"
                  transform="rotate(180 12 12)"
                />
              </svg>
            </button>
            <button
              className="btn btn-light rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-sm"
              type="button"
              aria-label="Right"
              style={{ width: 40, height: 40 }}
              onClick={() => scrollBy(1)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M13.17 12L8.22 7.05l1.41-1.41L16 12l-6.37 6.36-1.41-1.41z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Track */}
        <div
          id="programsTrack"
          ref={trackRef}
          className="d-flex gap-3 mt-4 overflow-auto pb-2 programs-track"
        >
          {whatsupslider.length > 0 ? (
            whatsupslider.map((p, idx) => (
              <article
                key={idx}
                className="program-card rounded-4 p-4 d-grid shadow-sm"
                style={{ gridTemplateColumns: "1.7fr 1fr", minWidth: "750px" }}
              >
                <div className="pe-2">
                  <a href={p.href} className="text-decoration-none text-dark">
                    <h2 className="mb-2" style={{ fontSize: "40px" }}>
                      {p.title}
                    </h2>
                  </a>

                  <span className="text-muted d-block mb-3 fs-4">
                    {p.name}
                  </span>

                  <ul className="list-unstyled m-0 p-0 small">
                    {Array.isArray(p.bullets) && p.bullets.length > 0 ? (
                      p.bullets.map((b, i) => (
                        <li key={i} className="d-flex gap-2 mb-2">
                          <span style={{ fontSize: 18, paddingBottom: "20px" }}>
                            {b}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li>No bullets available</li>
                    )}
                  </ul>
                </div>

                <div className="text-end">
                  {/* Ensure image path is correct */}
                  <img alt={p.title} className="img-fluid mt-n4" src={`${BASE_URL}${p.image}`} />
                </div>
              </article>
            ))
          ) : (
            <p>Loading programs...</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default WhatsUpSlider;
