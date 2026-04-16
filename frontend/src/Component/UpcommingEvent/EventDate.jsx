import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EventDate = () => {
  const [upcomingDate, setUpcomingDate] = useState(null);

  useEffect(() => {
    // Fetch data from API
    axios
      .get(`${BASE_URL}/api/selectupcomming_eventsdate`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setUpcomingDate(res.data); // <-- set entire array here!
        } else {
          setUpcomingDate([]); // empty array if no data
        }
      })
      .catch((err) => {
        console.error("Error fetching section data:", err);
        setUpcomingDate([]); // set empty array on error to avoid crash
      });
  }, []);

  // Loader
  if (upcomingDate === null) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  if (upcomingDate.length === 0) {
    return <p className="text-center py-5">No upcoming events found.</p>;
  }

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}



  return (
    <div className="container-fluid event-section">
      <h2 className="event-title">
        Bageshwar Dham - Upcoming Stories & Events
      </h2>

      <div className="timeline-line"></div>

      <Swiper
        modules={[Navigation]}
        navigation={true}
        spaceBetween={30}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 2 },
          992: { slidesPerView: 4 },
        }}
        className="mySwiper"
      >
        {upcomingDate.map((event, index) => (
          <SwiperSlide key={index} className="text-center">
            <div className="timeline-card" key={event.id}>
              <img src={`${BASE_URL}${event.image}`} alt={event.title} className="event-image" />
              <div className="event-content-info">
                <h5>{event.title}</h5>
                <p>
                  <strong>Date:</strong> {formatDate(event.startDate)} <b> to </b> {formatDate(event.endDate)}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
                <p>
                  <strong>Live Katha:</strong>{" "}
                  <NavLink to="#" className="event-link">
                    Sanskar Channel
                  </NavLink>{" "}
                  and{" "}
                  <NavLink to="#" className="event-link">
                    Bageshwar Dham
                  </NavLink>
                </p>
              </div>
            </div>
            <div className="timeline-dot">
              <img src={`${BASE_URL}${event.dpimage}`} alt={event.title} />
            </div>
            <div className="timeline-date">Date:- {formatDate(event.startDate)}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default EventDate;
