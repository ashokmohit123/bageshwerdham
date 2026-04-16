import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TopBanner = () => {
  const [heroes, setHeroes] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/topbanner`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setHeroes(res.data))
      .catch((err) => console.error("Error fetching hero:", err));
  }, []);

  if (!heroes.length) return null;

  return (
    <section className="top-section-hear">
      <div>

        {heroes
          .filter((item) => item.status === "active")
          .map((hero, index) => (
            <div
              className="hero object-cover"
              key={hero.id || index}
              style={{
                backgroundImage: `url(${BASE_URL}${hero.banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="hero-text">
                <h1 dangerouslySetInnerHTML={{ __html: hero.title }} />
                <NavLink to="/about" className="btn btn-start">
                  Start Now
                </NavLink>
              </div>

              <div className="mini-box">
                <video
                  src={`${BASE_URL}${hero.video_url}`}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="auto"
                  style={{ width: "100%", height: "170px" }}
                  onCanPlayThrough={(e) => e.target.play()}
                />

                <div className="info">
                  <div className="d-flex align-items-center justify-content-between">
                    <strong className="me-3">{hero.video_title}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default TopBanner;
