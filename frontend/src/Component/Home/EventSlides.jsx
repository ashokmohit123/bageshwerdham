import React, {useRef, useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EventSliders = () => {
const sliderRef = useRef(null); // ✅ Define the ref


 const [eventscarsoual, setEventscarsoual] = useState([]); // 👈 multiple

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectevents`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventscarsoual(res.data))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  if (!eventscarsoual.length) return null;


const slideLeft = () => {
if (sliderRef.current) sliderRef.current.scrollLeft -= 300;
};

const slideRight = () => {
if (sliderRef.current) sliderRef.current.scrollLeft += 300;
};

return (
<section className="top-section-hear">
<div className="wrapper">
<div className="container-fluid mt-4">
<div className="d-flex justify-content-between align-items-center flex-wrap mb-2">
<div>
<h2 className="fw-bold  mb-0">Events that Bageshwar Dham</h2>
<button className="text-white-50 text-decoration-none small btn btn-link p-0">
Discover events &gt;
</button>
</div>

{/* Arrow buttons aligned right */}
<div className="arrow-btn-info-top mb-3" style={{ display: 'flex', gap: '10px' }}>
<button className="arrow-btn arrow-left" onClick={slideLeft}>‹</button>
<button className="arrow-btn arrow-right" onClick={slideRight}>›</button>
</div>
</div>


<div className="slider-container">
<div
ref={sliderRef}
className="slider-wrapper d-flex"style={{ overflowX: 'hidden', height:'357px' }}>
{eventscarsoual
.filter((item) => item.status === "active") // ✅ sirf active rows dikhayega
.map((card, index) => (
<div className="event-card" key={index}>
<div className="video-card mx-auto text-center">
<img src={`${BASE_URL}${card.image_url}`} alt={`Video Thumbnail ${index + 1}`} className="img-fluid" />
<video
src={`${BASE_URL}${card.video_url}`}
muted
loop
playsInline
autoPlay
className="mt-2"
style={{ width: '100%' }}
></video>
<p className="bag-description mt-2">{card.description}</p>
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

export default EventSliders;