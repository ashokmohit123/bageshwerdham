import React, { useEffect, useState } from "react";
import axios from "axios";
import TestimonialDataSlider from "./TestimonialDataSlider";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TestimonialSlider = () => {
  const [testimonialSlides, setTestimonialSlides] = useState([]);

  // ✅ Fetch data from backend
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selecttestimonials`, {
        headers: { apikey: "12345" }, // 🔑 same key as backend
      })
      .then((res) => {
        // ✅ Map API response to slider data
        const formattedSlides = res.data.map((item) => ({
          name: item.name,
          role: item.role,
          quote: item.quote,
          description: item.description,
          bgImage: `${BASE_URL}${item.bgImage}`, // add server URL
          avatar: `${BASE_URL}${item.avatar}`,   // add server URL
        }));

        setTestimonialSlides(formattedSlides);
      })
      .catch((err) => {
        console.error("❌ Fetch testimonials error:", err);
      });
  }, []);

  return (
    <>
      {testimonialSlides.length > 0 ? (
        <TestimonialDataSlider slides={testimonialSlides} />
      ) : (
        <p className="text-center">Loading testimonials...</p>
      )}
    </>
  );
};

export default TestimonialSlider;
