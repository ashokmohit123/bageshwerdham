import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UpcomingEvents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcommingevents`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        setEvents(res.data || []); // ✅ safety check
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
      });
  }, []);

  console.log("Fetched events:", events);



  const slideLeft = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const slideRight = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="mt-3 py-3" style={{ backgroundColor: "#deedff" }}>
      {/* Intro */}
      <div className="container text-center text-black">
        <h3 className="fw-bold display-5 mb-3" style={{ fontSize: "2.5rem" }}>
        🛕  Pujya Maharaj Shri Bageshwar Dham Sarkar
        </h3>
        <p className="lead mb-0" style={{ color: "black" }}>
          With events, one-on-one coaching, and programs designed to power your growth,
          Tony’s foundational strategies are informed by over four and a half decades
          of extraordinary results.
        </p>
      </div>

      {/* Upcoming Events */}
      <section className="wrapper2 mt-2" style={{ maxWidth: "1600px", padding: "40px 20px 0px" }}>
        {/* Heading + Arrows */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <h2 className="fw-bold mb-0 text-dark">Upcoming Events</h2>
            
            <NavLink to="#" className="text-decoration-none small text-dark">
              Explore all events &gt;
            </NavLink>
          </div>
          <div className="arrow-btn-info-top d-flex gap-2">
            <button 
              className="arrow-btn arrow-left" 
              onClick={slideLeft}
              style={{
              
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px"
              }}
            >
              &#8249;
            </button>
            <button 
              className="arrow-btn arrow-right" 
              onClick={slideRight}
              style={{
              
                color: "white", 
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px"
              }}
            >
              &#8250;
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div 
          className="slider-container" 
          style={{ 
            overflow: "hidden", 
            // height: "600px",
            position: "relative",
          }}
        >
          <div
            className="slider-wrapper"
            style={{
              display: "flex",
              height: "100%",
              width: `${events.length * 100}%`,
              transition: "transform 0.5s ease-in-out",
              transform: `translateX(-${currentIndex * (100 / events.length)}%)`,
            }}
          >
            {events.map((event, index) => (
              <div
                key={index}
                className="object-cover"
                style={{
                  width: `${100 / events.length}%`,
                //   height: "100%",
                  position: "relative",
                 backgroundImage: `url(${BASE_URL}${event.image})`, // ✅ fixed
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  display: "flex",
                  alignItems: "flex-end",
                  flexShrink: 0,
                    height: '80vh',
                }}
              >
                {/* Shadow overlay */}
                <div
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "66%",
                  }}
                ></div>

                <div 
                  className="hero-text p-4" 
                  style={{ 
                   
                    borderRadius: "10px",
                    margin: "20px",
                    position: "relative",
                    zIndex: 2,
                    maxWidth: "600px"
                  }}
                >
                  <h1 style={{ fontSize: "2.5rem", marginBottom: "20px", color: "white" }}>{event.title}</h1>
                  <div className="d-flex gap-4 flex-wrap">
                    <button 
                      className="btn btn-start"
                      style={{ 
                       
                        border: "none",
                        borderRadius: "25px",
                        padding: "10px 20px"
                      }}
                    >
                      Learn More
                    </button>
                    {event.date && (
                      <div className="d-flex flex-column">
                        <span style={{ fontWeight: 700, color: "#bdbcbc" }}>Date</span>
                        <span style={{ fontSize: "19px", fontWeight: 700, color: "white" }}>{event.date}</span>
                      </div>
                    )}
                    {event.place && (
                      <div className="d-flex flex-column">
                        <span style={{ fontWeight: 700, color: "#bdbcbc" }}>Place</span>
                        <span style={{ fontSize: "19px", fontWeight: 700, color: "white" }}>{event.place}</span>
                      </div>
                    )}
                    {event.timezone && (
                      <div className="d-flex flex-column">
                        <span style={{ fontWeight: 700, color: "#bdbcbc" }}>Timezone</span>
                        <span style={{ fontSize: "19px", fontWeight: 700, color: "white" }}>{event.timezone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default UpcomingEvents;
